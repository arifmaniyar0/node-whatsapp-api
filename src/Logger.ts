import fs from "fs";
import path from "path";

class Logger {
    LOG_FILE: string = 'logger.txt';

    log(log_data: string, type = 'Exception') {
        try {
            var file_path = path.join(__dirname, '..', this.LOG_FILE);
            // this.createSessionsFileIfNotExists(file_path);

            var data = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + ', type: ' + type + ', ' +  log_data + '\r\n';
            fs.appendFileSync(file_path, data, 'utf-8');
            console.error('log: ' + data);
        } catch(err: any) {
            console.error('log update Error: ', err.message);
        }
    }

    // createSessionsFileIfNotExists = function(file_path: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         if (!fs.existsSync(file_path)) {
    //             try {
    //                 fs.writeFileSync(file_path, '');
    //                 console.log('Sessions file created successfully.');
    //                 resolve('Sessions file created successfully');
    //             } catch(err) {
    //                 reject(err);
    //             }
    //         }
    //     })
    // }
}

export default new Logger();