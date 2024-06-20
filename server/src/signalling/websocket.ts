import ws, { WebSocket } from 'ws';
import { messageDataI, messageHandler } from './messageHandler';

export const wss = new ws.Server({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  console.log("New Websocket client connection is eshtablished!");

  ws.on('message', (message: string) => {
    let data: string | messageDataI = message.toString();

    console.log(data);

    // handle the types of message 
    try {
      data = JSON.parse(data);
      if (typeof data === "object") {
        messageHandler(ws, data);
      }
    } catch (err) {
      console.log('not a JSON data!')
    }

    ws.send(`Server received your message: ${message}`);
  });

  ws.on('close', () => {
    console.log('close the connection!');
  })

  ws.on('error', () => {
    console.log('error');
  })


  ws.send('send data to the server!!!');

})

