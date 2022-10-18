import { ISession } from "./interfaces";

class SessionData {
    static sessions: ISession[] = [];

    static setSession(_sessions: ISession[]) {
        SessionData.sessions = _sessions;
    }

    static appendSession(_sessions: ISession) {
        SessionData.sessions.push(_sessions);
    }

    static isSessionExist(id: string) {
        return SessionData.sessions.findIndex(sess => sess.clientId == id) !== -1;
    }

    static getSessionByID(id: string) {
        return SessionData.sessions.find(sess => sess.clientId == id)
    }

    static removeSessionByID(id: string) {
        var index = SessionData.sessions.findIndex(sess => sess.clientId == id)
        index !== -1 && SessionData.sessions.splice(index, 1);
    }

    static emptySession() {
        SessionData.sessions = [];
    }
}

export default SessionData;