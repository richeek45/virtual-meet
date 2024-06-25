import { MESSAGE_TYPES, WsDataI } from "@/state/atoms";
import { sendMessage } from "./useWebSocket";


export const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    return false;
  }
}

export const onLogin = (data: WsDataI, setWsData: (val: WsDataI) => void) => {
  console.log('setting values', data)
  setWsData(data);

}

export const onOfferReceived = async (
  conn: WebSocket,
  data: WsDataI, 
  rtcPeerConnection: RTCPeerConnection
) => {
  // 1. Set offer to remote description 
  // 2. create the answer
  // 3. Set answer to local description

  if (data.offer) {
    await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
    const answer = await rtcPeerConnection.createAnswer();
    rtcPeerConnection.setLocalDescription(answer);
    if (data.user) {
      sendMessage(conn, data.user, { type: MESSAGE_TYPES.ANSWER, answer });
    }
  }
}

export const onAnswerReceived = (data: WsDataI, rtcPeerConnection: RTCPeerConnection) => {
  if (data.answer) {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }
}

export const onIceCandidate = (data: WsDataI, rtcPeerConnection: RTCPeerConnection) => {
  if (data.candidate) {
    rtcPeerConnection.addIceCandidate(data.candidate)   
  }
}

export const handleMessage = (
  conn: WebSocket, 
  data: WsDataI, 
  rtcPeerConnection: RTCPeerConnection, 
  setWsData: (val: WsDataI) => void
) => {
  console.log(data);
  
  switch(data.type) {
    case MESSAGE_TYPES.LOGIN: {
      onLogin(data, setWsData);
      break;
    }
    case MESSAGE_TYPES.OFFER: {
      onOfferReceived(conn, data, rtcPeerConnection);
      break;
    }
    case MESSAGE_TYPES.ANSWER: {
      onAnswerReceived(data, rtcPeerConnection);
      break;
    }
    case MESSAGE_TYPES.ICE_CANDIDATE: {
      onIceCandidate(data, rtcPeerConnection);
    }
  }
}

export const getMediaStream = async (
  video: HTMLVideoElement, 
  constraints: MediaStreamConstraints
) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream; 

  video.onloadedmetadata = () => {
    video.play();
  }

  return stream;
}