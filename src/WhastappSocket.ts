import {Server} from 'socket.io'

class WhatsAppSocket {
  static io: Server
  constructor(_io: Server) {
    WhatsAppSocket.io = _io;
    WhatsAppSocket.io.on("connection", function(socket) {
      // wss.emit('connection')
  
      console.log('Socket Init', socket.id);

        // let whatsapp = new WebSocket("wss://web.whatsapp.com/ws");
        
        // console.log('open', whatsapp.OPEN)
        // whatsapp.send('test');
        
        // _io.onmessage		= function(e) { whatsapp.send(e.data); }
        // _io.onclose			= function(e) { whatsapp.close(); }
        // whatsapp.onopen		= function(e) { ws.send("whatsapp_open"); }
        // whatsapp.onmessage	= function(e) { ws.send(e.data); }
        // whatsapp.onclose	= function(e) { ws.close(); }
    });

    WhatsAppSocket.io.on('get-message', (msg) => {
      console.log('my message', msg)
    })
  }
}


export default WhatsAppSocket;