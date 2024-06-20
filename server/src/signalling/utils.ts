import { WebSocket } from "ws";
import { connections } from "./messageHandler"

export const sendMessageClient = (conn: WebSocket, message: object) => {
  conn.send(JSON.stringify(message));
}

export const handleLogin = (conn: WebSocket, user: string) => {
  // store the login info and send back success message

  // 1. if other user is logged in send a response
  // 2. if some other issues send error
  // 3. log the user in
  
  if (connections[user]) {
    const data = { user, success: false, message: "User with the same name is already logged in!" };
    sendMessageClient(conn, data)
  } else if (!connections[user]) {
    connections.user = conn; // add it to the list of connections
    const data  = { user, success: true, message: "User logged in!" };
    sendMessageClient(conn, data);
  } else {
    const data = { user, success: false, message: "Logged in error. Please try again after some time!" };
    sendMessageClient(conn, data);
  }
}










