import { useRef } from "react";
import { handleMessage, isValidJSON } from "./helper";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { usernameAtom, wsDataAtom, defaultWsData } from "@/state/atoms";

export const sendMessage = (conn: WebSocket, user: string, message: object) => {
  conn.send(JSON.stringify({
    ...message, user
  }));
}

const useWebSocket = ({ port } : { port: number}) => {
  const websocket = useRef<WebSocket | null>(null);
  const [wsData, setWsData] = useAtom(wsDataAtom);
  const username = useAtomValue(usernameAtom);


  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);

    ws.onopen = () => {
      console.log('Websocket connection is eshtablished!!');
      setWsData({ ...defaultWsData, error: false });
    }

    ws.onmessage = (message) => {
      // message.data can be string or JSON -> message is a event
      const data = isValidJSON(message?.data) ? JSON.parse(message?.data) : message?.data;
      handleMessage(username, data, setWsData);  
    }

    websocket.current = ws;

    ws.onerror = (error) => {
      // close the connection
      setWsData({ ...defaultWsData, error: true })
      console.log(error, 'websocke error!!!!!!!!!!!!!!!!');
    }

    return () => ws.close();
  }, [])


  return {connection: websocket.current }
}

export default useWebSocket;