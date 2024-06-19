import ws, { WebSocket } from 'ws';

export const wss = new ws.Server({ noServer: true });

const users = {};

wss.on('connection', (ws: WebSocket) => {
  console.log("New Websocket client connection is eshtablished!");

  ws.on('message', (message: string) => {
    const data = message.toString();
    console.log(data);

    // handle the types of message 

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

