import { WebSocket } from "ws";
import { ExtWebSocket, MESSAGE_TYPES, connections } from "./messageHandler"


export const sendMessageClient = (conn: WebSocket, message: object) => {
  conn.send(JSON.stringify(message));
}

export const handleLogin = (conn: ExtWebSocket, user: string) => {
  // store the login info and send back success message

  // 1. if other user is logged in send a response
  // 2. if some other issues send error
  // 3. log the user in
  const userData = { user, type: MESSAGE_TYPES.LOGIN };

  if (connections[user]) {
    const data = { ...userData, success: false, error: false, message: "User with the same name is already logged in!" };
    sendMessageClient(conn, data)
  } else if (!connections[user]) {
    connections[user] = conn; // add it to the list of connections
    conn.name = user;
    const data  = { ...userData, success: true, error: false, message: "User logged in!" };
    sendMessageClient(conn, data);
  } else {
    const data = { ...userData, success: false, error: true, message: "Logged in error. Please try again after some time!" };
    sendMessageClient(conn, data);
  }
}

export const handleOffer = (conn: ExtWebSocket, user: string, data: object) => {
  // 1.Send the offer to the user
  const remoteConn = connections[user];
  if (remoteConn) {
    sendMessageClient(remoteConn, { ...data, user: conn.name });
  }
}

export const handleAnswer = (conn: WebSocket, user: string, data: object) => {
  // 1. Send all the answers from the multiple offers back to the offered user.
  
  const remoteConn = connections[user];
  if (remoteConn) {
    sendMessageClient(remoteConn, data );
  }
}

export const handleIceCandidate = (conn: WebSocket, user: string, data: object) => {
  const remoteConn = connections[user];
  if (remoteConn !== null) {
    sendMessageClient(remoteConn, data);
  }
}

export const handleEndConnection = (conn: WebSocket, user: string, data: object) => {
  Object.keys(connections).forEach(connUser => {
    if (connUser !== user) {
      sendMessageClient(connections[connUser], data);
    }
  })

} 






