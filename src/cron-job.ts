import CronJob from 'cron'
import { WAState } from 'whatsapp-web.js';
import { fetch_sessions, remove_session, update_session } from './db.service';
import { ISession, ISessionModel } from './interfaces';
import SessionData from './SessionData';
import { get_status } from './whatsapp-services';


var job = new CronJob.CronJob(
	'0 0/1 * * *',
	async function() {
		console.log('Every Hour', new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
        // var all_sessions = await fetch_sessions();
        
        SessionData.sessions.forEach(async (s: ISession) => {
            try {
                // var session_obj = SessionData.getSessionByID(s.clientId);
                var session_obj = s;
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
                    }
                    else {
                        await update_session({ clientId: s.clientId, isReady: false }, { isReady: true })
                    }
                }
                else {
                    await remove_session(s.clientId);
                }
                
            } catch {}
        })

	},
	null,
	true,
	'Asia/Kolkata'
);

console.log('job started');
job.start();
export default job;

