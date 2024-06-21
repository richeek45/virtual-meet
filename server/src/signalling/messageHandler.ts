import { WebSocket } from "ws";
import { handleAnswer, handleIceCandidate, handleLogin, handleOffer } from "./utils";

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
  data: string;
}

// { name1: conn1, name2: conn2, name3: conn3 }

interface Connections {
  [key: string]: WebSocket
}

export interface ExtWebSocket extends WebSocket {
  name: string;
}

export const connections: Connections = {};



export const messageHandler = (conn: ExtWebSocket, message: messageDataI) => {
  const user = message.user;
  console.log(user, message.type);

  switch(message.type) {

    case MESSAGE_TYPES.LOGIN: {
      handleLogin(conn, user);
      break;
    }
    case MESSAGE_TYPES.OFFER: {
      handleOffer(conn, user, message)
      break;
    }
    case MESSAGE_TYPES.ANSWER: {
      handleAnswer(conn, user, message)
      break;
    }
    case MESSAGE_TYPES.ICE_CANDIDATE: {
      handleIceCandidate(conn, user, message);
      break;
    }
    case MESSAGE_TYPES.LEAVE: {

      break;
    }

  }

}