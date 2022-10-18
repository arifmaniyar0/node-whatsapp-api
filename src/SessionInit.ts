import {Server} from 'socket.io';
import { Client, LocalAuth, WAState } from 'whatsapp-web.js';
import { fetch_session_by_id, insert_session, remove_session, session_exists, update_session } from './db.service';
import sessionData from './SessionData';
import { ISession } from './interfaces';
import Logger from './Logger';
import WhatsAppSocket from './WhastappSocket';

async function InitClient(id: string) {
    try {
        // console.log('init')
        
        var wss = WhatsAppSocket.io;
        var isExist = await session_exists(id);
        if(!isExist) {
            var session_data: any = {
                clientId: id,
                isReady: false
            }
            await insert_session(session_data);
        }
        else {
            if(sessionData.isSessionExist(id)) {
                var _session = await fetch_session_by_id(id);
                if(_session) {
                    if(!_session.isReady) {
                        await update_session({ clientId: id }, { qr: null });
                        var s_obj = sessionData.getSessionByID(id);
                        if(s_obj) {
                            try {
                                await s_obj.client.destroy();
                                await s_obj.client.initialize();
                                return;
                            }
                            catch {
                                return;
                            }
                        }
                    }
                }
            }
        }

        const client = new Client({
            puppeteer: { headless: false }, // Make headless true or remove to run browser in background
            authStrategy: new LocalAuth({
                clientId: id
            })
        });
        
        client.initialize();
    
        client.on('qr', async (qr) => {
            // NOTE: This event will not be fired if a session is specified.
            wss.emit('qr', { id, qr });
            console.log('QR RECEIVED', [id, qr]);

            await update_session({ clientId: id }, { qr })

            var s: any = await fetch_session_by_id(id);
            if(s && !s.isReady) {
                var session_date = new Date(s.createdAt);
                session_date.setMinutes(session_date.getMinutes() + 3);
                if(session_date < new Date()) {
                    await remove_session(s.clientId);
                    client.destroy();
                    sessionData.removeSessionByID(s.clientId);
                }
            }
        });
        
        client.on('authenticated', () => {
            console.log('AUTHENTICATED', { id });
            wss.emit('authenticated', { id });
        });
        
        client.on('auth_failure', async (msg) => {
            // Fired if session restore was failed
            console.error('AUTHENTICATION FAILURE', msg);
            wss.emit('auth_failure', { id, msg })
            await update_session({ clientId: id }, { isReady: false });
        });
        
        client.on('change_state', async function(state) {
            console.log('change_state', state);
            wss.emit('change_state', { id, text: 'State: ' + state });
            // if(state != WAState.CONNECTED && state != WAState.OPENING && state != WAState.PAIRING)
            //     await update_session({ clientId: id }, { isReady: false });
        });
    
        client.on('disconnected', async (reason) => {
            console.log('disconnected', reason);
            wss.emit('disconnected', { id, msg: reason });
            client.destroy();
            // client.initialize();
        
            sessionData.removeSessionByID(id);
    
            await remove_session(id);
        });
    
        client.on('ready', async () => {
            console.log('READY', { status: await client.getState(), id });
            wss.emit('ready', { status: await client.getState(), id });
            await update_session({ clientId: id }, { isReady: true, qr: null });
        });
    
        var session: ISession = {
            client: client,
            clientId: id,
            isReady: false
        };
    
        sessionData.appendSession(session);
    }
    catch(err: any) { 
        
        Logger.log(`Error: ${err.message}`, 'session_init_error')
    }
}


async function InitExistClient(client: Client, id: string) {
    try {
        var wss = WhatsAppSocket.io;
        // console.log('init')
        // var isExist = await session_exists(id);
        // if(!isExist) {
        //     var session_data: any = {
        //         clientId: id,
        //         isReady: false
        //     }
        //     await insert_session(session_data);
        // }
        // else {
        //     if(sessionData.isSessionExist(id)) {
        //         var _session = await fetch_session_by_id(id);
        //         if(_session) {
        //             if(!_session.isReady) {
        //                 var s_obj = sessionData.getSessionByID(id);
        //                 if(s_obj) {
        //                     try {
        //                         await s_obj.client.destroy();
        //                         await s_obj.client.initialize();
        //                         return;
        //                     }
        //                     catch {
        //                         return;
        //                     }
        //                 }
                        
        //             }
        //         }
        //     }
        // }

        // const client = new Client({
        //     puppeteer: { headless: true }, // Make headless true or remove to run browser in background
        //     authStrategy: new LocalAuth({
        //         clientId: id
        //     })
        // });
        
        client.initialize();
    
        client.on('qr', async (qr) => {
            // NOTE: This event will not be fired if a session is specified.
            wss.emit('qr', { id, qr });
            console.log('QR RECEIVED', [id, qr]);

            await update_session({ clientId: id }, { qr })

            var s: any = await fetch_session_by_id(id);
            if(s && !s.isReady) {
                var session_date = new Date(s.createdAt);
                session_date.setMinutes(session_date.getMinutes() + 3);
                if(session_date < new Date()) {
                    await remove_session(s.clientId);
                    client.destroy();
                    sessionData.removeSessionByID(s.clientId);
                }
            }
        });
        
        client.on('authenticated', () => {
            console.log('AUTHENTICATED', { id });
            wss.emit('authenticated', { id });
        });
        
        client.on('auth_failure', async (msg) => {
            // Fired if session restore was failed
            console.error('AUTHENTICATION FAILURE', msg);
            wss.emit('auth_failure', { id, msg })
            await update_session({ clientId: id }, { isReady: false });
        });
        
        client.on('change_state', async function(state) {
            console.log('change_state', state);
            wss.emit('change_state', { id, text: 'change_state, restarting...' });
            await update_session({ clientId: id }, { isReady: false });
        });
    
        client.on('disconnected', async (reason) => {
            console.log('disconnected', reason);
            wss.emit('disconnected', { id, msg: reason });
            client.destroy();
            // client.initialize();
        
            sessionData.removeSessionByID(id);
    
            await remove_session(id);
        });
    
        client.on('ready', async () => {
            console.log('READY', { status: await client.getState(), id });
            wss.emit('ready', { status: await client.getState(), id });
            await update_session({ clientId: id }, { isReady: true });
        });
    
        var session: ISession = {
            client: client,
            clientId: id,
            isReady: false
        };
    
        sessionData.appendSession(session);
    }
    catch(err: any) { 
        
        Logger.log(`Error: ${err.message}`, 'session_init_error')
    }
}

export {
    InitClient,
    InitExistClient
}