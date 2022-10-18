import mongoose from 'mongoose';
//process.env.MONGO_URI1 || 
var conn_string = process.env.MONGO_URI as string

class Connection {
  private connString: string;
  constructor(private readonly connectionString: string) {
    this.connString = connectionString;
    this.connect = this.connect.bind(this);
  }

  connect() {
    return new Promise((resolve, reject) => {
        try {
            mongoose.connect(this.connString);
            const db = mongoose.connection;
            db.once('open', function() {
                console.log('MongoDB Connection Established');
                resolve('MongoDB Connection Established');
            });
            // db.collection('sessions').drop()
        }
        catch(err: any) {
            console.log(err)
            reject(err.message)
        }
    })
  }

}

export default new Connection(conn_string);