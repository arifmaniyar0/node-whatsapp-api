import { Client } from "whatsapp-web.js";
import * as mongoose from 'mongoose';

interface ISession {
    clientId: string,
    client: Client,
    qr?: string,
    isReady: boolean,
}

interface ISessionModel extends mongoose.SchemaOptions {
    clientId: string,
    isReady: boolean,
    qr?: string,
    createdAt: Date,
    updatedAt: Date
}

export {
    ISession,
    ISessionModel
}