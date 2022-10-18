import mongoose from 'mongoose';
//process.env.MONGO_URI1 || 
var conn_string = 'mongodb+srv://vastweb:AZIhnP0GiD8HXJKT@cluster0.vrtnp.mongodb.net/whatsappDB_Test1?retryWrites=true&w=majority';
// mongodb+srv://whatsapp_user:8ok9Qp4S5fF0bwfK@cluster0.2hobu.mongodb.net/whatsappDB?retryWrites=true&w=majority

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