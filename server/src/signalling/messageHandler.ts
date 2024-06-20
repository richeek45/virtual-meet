import { WebSocket } from "ws";
import { handleLogin } from "./utils";

export enum MESSAGE_TYPES {
  LOGIN = "LOGIN",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  ICE_CANDIDATE = "ICE_CANDIDATE",
  LEAVE = "LEAVE" 
}

export interface messageDataI {
  type: MESSAGE_TYPES; 
  user: string; 
}

// { name1: conn1, name2: conn2, name3: conn3 }

interface Connections {
  [key: string]: WebSocket
}

export const connections: Connections = {};



export const messageHandler = (conn: WebSocket, message: messageDataI) => {
  console.log(message);
  const user = message.user;

  switch(message.type) {

    case MESSAGE_TYPES.LOGIN: {
      handleLogin(conn, user);
      break;
    }
    case MESSAGE_TYPES.OFFER: {

      break;
    }
    case MESSAGE_TYPES.ANSWER: {

      break;
    }
    case MESSAGE_TYPES.ICE_CANDIDATE: {

      break;
    }
    case MESSAGE_TYPES.LEAVE: {

      break;
    }

  }

}