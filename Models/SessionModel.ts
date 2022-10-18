import * as mongoose from 'mongoose';
import { ISessionModel } from '../src/interfaces';

var SessionSchema = new mongoose.Schema<ISessionModel>({
    clientId: String,
    isReady: Boolean,
    qr: String
}, { timestamps: true })

var SessionModel = mongoose.model('Session', SessionSchema);

export default SessionModel;