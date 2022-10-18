import env from 'dotenv'
env.config();

import express, {Express} from 'express';
import http from 'http'
import {Server} from 'socket.io'

// local imports
// import {createSessionsFileIfNotExists, updateSessionFile, readSessions} from './src/file_handler'
import {InitClient} from './src/SessionInit'
import WhatsAppSocket from './src/WhastappSocket'
import middleware from './src/middleware'
import Routes from './src/services';
import { fetch_sessions, fetch_session_by_id, remove_session } from './src/db.service';
import Conn from './db/db';
import sessionsData from './src/SessionData';
import logger from './src/Logger';
import './src/cron-job';
// import { fork } from 'child_process';

class App {
    app: Express
    port: string | number
    SESSION_FILE_PATH = 'session.json';

    constructor() {
        console.log('Constructor Called');
        this.app = express();
        this.port = process.env.PORT || 3000;
        middleware(this.app);

        const server = http.createServer(this.app);
        var _io = new Server(server);

        new WhatsAppSocket(_io);

        fetch_sessions().then(async (data) => {
            // data.forEach(async (s) => {
            //     if(s.isReady) {
            //         // await this.InitWait(s.clientId);
            //         console.log('init done', data.length)
            //         return;
            //     }
            //     else {
            //         var session_date = new Date(s.createdAt);
            //         session_date.setDate(session_date.getDate() + 20);
            //         if(session_date < new Date()) {
            //             remove_session(s.clientId);
            //         }
            //     }
            // })

            for(let i = 0; i < data.length; i++) {
                if(data[i].isReady) {
                    await this.InitWait(data[i].clientId);
                }
                else {
                    var session_date = new Date(data[i].createdAt);
                    session_date.setDate(session_date.getDate() + 20);
                    if(session_date < new Date()) {
                        remove_session(data[i].clientId);
                    }
                }
            }
        });

        
        this.app.get('/', (_, res) => {
            // res.send('Whatsapp Web Api');
            res.sendFile('index.html', {
                root: __dirname
            });
        });

        this.app.get('/fetch_qr/:session_id', async (req, res) => {
            try {
                const {session_id} = req.params;
                var ss = sessionsData.getSessionByID(session_id);
                if(!ss) {
                    throw new Error('Session not found');
                }
                // await get_status(ss.client)
                var session = await fetch_session_by_id(session_id);
        
                return res.json({
                    status: session ? true : false,
                    session
                });
            }
            catch(err: any) {
                logger.log(`Error: ${err.message}`)
                return res.json({
                    status: false,
                    session: err.message
                });
            }
        });

        Routes(this.app);

        this.app.get('/init/:session_id', async (req, res) => {
            try {
                const { session_id } = req.params;

                if(!session_id) {
                    throw new Error('session id can not be empty');
                }
                
                await this.init(session_id);
                var x = setInterval(async () => {
                    
                    var s_data = await fetch_session_by_id(session_id);
                    if(s_data)
                    {
                        if(s_data.isReady) {
                            clearInterval(x);
                            return res.json({
                                status: true,
                                message: 'CONNECTED'
                            })
                        }
                        else if(s_data.qr) {
                            clearInterval(x);
                            return res.json({
                                status: false,
                                message: 'QR',
                                qr: s_data.qr
                            })
                        }
                    }
                }, 2000)
            }
            catch(err: any) {
                logger.log(`Error: ${err.message}`)
                return res.json({
                    status: false,
                    message: 'something went wrong'
                })
            }
        })

        server.listen(this.port, () => {
            return console.log(`Express is listening at http://localhost:${this.port}`);
        });
    }

    async init(id: string) {
        if(id) {
            await InitClient(id);
        }
    }

    async InitWait(id: string) {
        return new Promise((resolve, _) => {
            if(id) {
                setTimeout(async () => {
                    await InitClient(id);
                    resolve(true);
                }, 4000);
            }
            else {
                resolve(true);
            }
        })
    }
}


process.on('uncaughtException', function(err) {
    // Handle the error safely
    logger.log(`${err.message}`, 'uncaughtException');
    // process.exit();
})

Conn.connect()
.then(() => {
    new App();
}).catch(err => {
    // console.log('Error', err);
    logger.log(`${err.message}`, 'db error');
})

export default App;