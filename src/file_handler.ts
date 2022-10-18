import fs from "fs";
import path from "path";
import { ISession } from "./interfaces";

const readSessions = function(SESSION_FILE_PATH: string): ISession[] {
    var session_data: ISession[] = [];
    try {
        var file_path = path.join(__dirname, '..', SESSION_FILE_PATH);
        
        createSessionsFileIfNotExists(file_path);
        var data = fs.readFileSync(file_path, "utf8");
        session_data = [...JSON.parse(data)];
        return session_data;
    }
    catch {
        return session_data;
    }
}

const updateSessionFile = function(_sessions: ISession[], SESSION_FILE_PATH: string) {
    // var sessions: ISession[] = JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
    try {
        var file_path = path.join(__dirname, '..', SESSION_FILE_PATH);
        fs.writeFileSync(file_path, JSON.stringify(_sessions));
        console.log('Sessions file created successfully.');
    } catch(err) {
        console.log('Failed to create sessions file: ', err);
    }
}


const createSessionsFileIfNotExists = function(file_path: string): Promise<string> {
        return new Promise((resolve, reject) => {
        if (!fs.existsSync(file_path)) {
            try {
              fs.writeFileSync(file_path, JSON.stringify([]));
              console.log('Sessions file created successfully.');
              resolve('Sessions file created successfully');
            } catch(err) {
              console.log('Failed to create sessions file: ', err);
              reject(err);
            }
        }
    })
}

export {
    updateSessionFile,
    createSessionsFileIfNotExists,
    readSessions,
}