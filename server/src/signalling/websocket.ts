import ws from 'ws';
import { ExtWebSocket, connections, messageDataI, messageHandler } from './messageHandler';

export const wss = new ws.Server({ noServer: true });

wss.on('connection', (ws: ExtWebSocket) => {
  console.log("New Websocket client connection is eshtablished!");

  ws.on('message', (message: string) => {
    let data: string | messageDataI = message.toString();
    // handle the types of message 
    try {
      data = JSON.parse(data);
      if (typeof data === "object") {
        messageHandler(ws, data);
      }
    } catch (err) {
      console.log('not a JSON data!')
    }

    ws.send(`Server received your message`);
  });

  ws.on('close', () => {
    // remove the connection
    delete connections[ws.name];
    console.log('close the connection!');
  })

  ws.on('error', () => {
    delete connections[ws.name];
    console.log('error');
  })


  ws.send('send data to the server!!!');

})

