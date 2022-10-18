import Session from "../Models/SessionModel"
import { ISessionModel } from "./interfaces";

const fetch_sessions = async () => {
    var sessions = await Session.find({}).lean();
    return sessions;
}

const fetch_failed_sessions = async () => {
    // let date = new Date();
    // date.setHours(date.getHours() - 23);
    var sessions = await Session
    .find({ isReady: false, 
        // createdAt : { $lt: date } 
    })
    .lean();

    return sessions;
}

const fetch_session_by_id = async (id: string) => {
    var session = await Session.findOne({clientId: id}).lean();
    return session;
}

const session_exists = async (id: string) => {
    var isExist = await Session.exists({ clientId: id });
    if(isExist) return true
    else return false
}

const update_session = async (filter: any, updateData: any) => {
    try {
        await Session.updateOne(filter, updateData);
    }
    catch {}
}

const insert_session = async (session: ISessionModel) => {
    try {
        var ss = new Session(session);
        await ss.save();
    }
    catch {}
}

const remove_session = async (id: string) => {
    try {
        await Session.deleteOne({ clientId: id });
    }
    catch {}
}

const remove_unused_sessions = async () => {
    try {
        let date = new Date();
        date.setHours(date.getHours() - 1);
        await Session.deleteMany({ isReady: false, createdAt : { $lt: date } });
    }
    catch {}
}


export {
    fetch_sessions,
    fetch_session_by_id,
    update_session,
    insert_session,
    remove_session,
    session_exists,
    fetch_failed_sessions,
    remove_unused_sessions
}