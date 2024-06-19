import { useRef } from "react";
import { isValidJSON } from "./helper";
import { useEffect } from "react";

export const sendMessage = (conn: WebSocket, user: string, message: object) => {
  conn.send(JSON.stringify({
    ...message, user
  }));
}

const useWebSocket = ({ port } : { port: number}) => {
  const websocket = useRef<WebSocket | null>(null);


  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);

    ws.onopen = () => {
      console.log('Websocket connection is eshtablished!!');
    }

    ws.onmessage = (message) => {
      // message.data can be string or JSON -> message is a event

      const data = isValidJSON(message?.data) ? JSON.parse(message?.data) : message?.data;
      console.log(data);  

    }

    websocket.current = ws;

    ws.onerror = (error) => {
      // close the connection
      console.log(error);
    }

    return () => ws.close();
  }, [])


  return {connection: websocket.current }
}

export default useWebSocket;