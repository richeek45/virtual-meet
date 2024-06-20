import { WebSocket } from "ws";
import { MESSAGE_TYPES, connections } from "./messageHandler"

export const sendMessageClient = (conn: WebSocket, message: object) => {
  conn.send(JSON.stringify(message));
}

export const handleLogin = (conn: WebSocket, user: string) => {
  // store the login info and send back success message

  // 1. if other user is logged in send a response
  // 2. if some other issues send error
  // 3. log the user in
  const userData = { user, type: MESSAGE_TYPES.LOGIN };

  if (connections[user]) {
    const data = { ...userData, success: false, error: false, message: "User with the same name is already logged in!" };
    sendMessageClient(conn, data)
  } else if (!connections[user]) {
    connections.user = conn; // add it to the list of connections
    const data  = { ...userData, success: true, error: false, message: "User logged in!" };
    sendMessageClient(conn, data);
  } else {
    const data = { ...userData, success: false, error: true, message: "Logged in error. Please try again after some time!" };
    sendMessageClient(conn, data);
  }
}

export const handleOffer = (conn: WebSocket, data: object) => {

  sendMessageClient(conn, data);
}








