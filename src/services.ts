import { Router, Express } from 'express'
import { get_status, logout_client, send_message } from './whatsapp-services';
import sessionData from './SessionData';
import { fetch_failed_sessions, fetch_sessions, remove_session, update_session } from './db.service';
import {WAState} from 'whatsapp-web.js';
import Logger from './Logger';
import { InitExistClient } from './SessionInit';
import { ISessionModel } from './interfaces';
import SessionData from './SessionData';
import App from '../app';

const router = Router();

export default (app: Express): Router => {
    
    app.post('/send-message', async (req, res) => {
        try {
            const { number, message, sender } = req.body;

            // var my_sessions = [...getSessions()];

            var cl_data = sessionData.getSessionByID(sender);
            if(!cl_data) {
                await new App().init(sender);
                throw new Error('session not found with id ' + sender);
            }

            var WA_status = await get_status(cl_data.client);

            if(WA_status != WAState.CONNECTED) {
                throw new Error(`Session not connected got ${WA_status} state`);
            }

            var _msg = '';
            if(message?.toString()) {
                _msg = message?.toString();
            }
            else {
                return res.json({
                    status: false,
                    message: 'message is required'
                })
            }
            
            const msg = await send_message(cl_data.client, number, _msg);
            res.json(msg);

        } catch (error: any) {
            Logger.log(`Error: ${error.message}`, 'send-message')
            return res.json({
                status: false,
                message: error.message
            })
        }
    });

    app.get('/get-status/:session_id', async (req, res) => {
        try {
            const { session_id } = req.params;

            var WAClient = sessionData.getSessionByID(session_id);
            if(!WAClient) {
                throw new Error('session not found with id ' + session_id);
            }

            // console.log('info', WAClient.client.info);
            var WA_status: any = WAState.CONFLICT;

            try {
                WA_status = await get_status(WAClient.client);
            } catch { WA_status = WAState.CONFLICT; }
            
            if(WA_status != WAState.CONNECTED) {
                update_session({ clientId: WAClient.clientId }, { isReady: false })
                await WAClient.client.destroy();
                sessionData.removeSessionByID(WAClient.clientId);
                // WAClient.client.info;
                
                // InitExistClient(WAClient.client, WAClient.clientId);
                throw new Error('Session Not Connected');
            } 
            return res.json({
                status: true,
                message: WA_status
            })
        }
        catch(err: any) {
            Logger.log(`Error: ${err.message}`, 'get-status');
            return res.json({
                status: false,
                message: err.message
            })
        }
    })

    app.get('/logout-client/:session_id', async (req, res) => {
        try {
            const { session_id } = req.params;

            var WAClient = sessionData.getSessionByID(session_id);
            if(!WAClient) {
                throw new Error('session not found with id ' + session_id);
            }
            // var st = await WAClient.client.getState();

            // if(st == WAState.CONNECTED) {
            // }
            // try {
            //     // await Promise.all([logout_client(WAClient.client), remove_session(WAClient.clientId)])
            //     await logout_client(WAClient.client);
            // }
            // catch {}
            await logout_client(WAClient.client);
            await remove_session(WAClient.clientId);
            
            return res.json({
                status: true,
                message: 'Logged Out'
            })
        }
        catch(err: any) {
            Logger.log(`Error: ${err.message}`, 'logout-client');
            return res.json({
                status: false,
                message: err.message
            })
        }
    })

    app.get('/destroy/:session_id', async (req, res) => {
        try {
            const { session_id } = req.params;

            var WAClient = sessionData.getSessionByID(session_id);
            if(!WAClient) {
                throw new Error('session not found with id ' + session_id);
            }
            await WAClient.client.destroy();
            await remove_session(WAClient.clientId);
            
            return res.json({
                status: true,
                message: 'Browser Destroyed'
            })
        }
        catch(err: any) {
            Logger.log(`Error: ${err.message}`, 'destroy');
            return res.json({
                status: false,
                message: err.message
            })
        }
    })

    app.get('/failed-sessions', async (_, res) => {
        res.json(await fetch_failed_sessions());
    });

    app.get('/scan-sessions', async (_, res) => {
        var all_sessions = await fetch_sessions();
        let total_sessions = all_sessions.length;
        let connected_sessions = 0;
        let removed_sessions = 0;

        for(let i = 0; i < total_sessions; i++) {
            try {
                var s: ISessionModel = all_sessions[i];
                var session_obj = SessionData.getSessionByID(s.clientId);
                if(session_obj)
                {
                    var status: any = WAState.CONFLICT;
                    try {
                        status = await get_status(session_obj.client);
                    }
                    catch { status = WAState.CONFLICT }
                    if(status !== WAState.CONNECTED) {
                        SessionData.removeSessionByID(s.clientId);
                        await remove_session(s.clientId);
                        try {
                            await session_obj.client.logout();
                        } catch {}
                        try {
                            await session_obj.client.destroy();
                        }
                        catch {}
                        removed_sessions += 1;
                    }
                    else {
                        connected_sessions += 1;
                        await update_session({ clientId: s.clientId, isReady: false }, { isReady: true })
                    }
                }
                else {
                    await remove_session(s.clientId);
                }
                
            } catch {}
        }
        res.json({ total_sessions, connected_sessions, removed_sessions });
    })

    app.post('/testing', async (req, res) => {
        try {
            const { number, message, sender } = req.body;

            // var my_sessions = [...getSessions()];

            var cl_data = sessionData.getSessionByID(sender);
            if(!cl_data) {
                throw new Error('session not found with id ' + sender);
            }

            var WA_status = await get_status(cl_data.client);

            if(WA_status != WAState.CONNECTED) {
                throw new Error(`Session not connected got ${WA_status} state`);
            }

            var _msg = '';
            if(message?.toString()) {
                _msg = message?.toString();
            }
            else {
                return res.json({
                    status: false,
                    message: 'message is required'
                })
            }
            var msg: any = "";

            for(let i = 0; i < 20; i++) {
                msg = await send_message(cl_data.client, number, _msg);
            }

            res.json(msg);

        } catch (error: any) {
            // Logger.log(`Error: ${error.message}`, 'send-message')
            return res.json({
                status: false,
                message: error.message
            })
        }
    })

    return router;
    
}