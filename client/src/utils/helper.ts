import { FileMetadata, MESSAGE_TYPES, MessageEnum, ShareStatusEnum, WsDataI } from "@/state/atoms";
import { sendMessage } from "./useWebSocket";


export const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    return false;
  }
}

export const onLogin = (data: WsDataI, setWsData: (val: WsDataI) => void, setLoggedIn: (val: boolean) => void) => {
  console.log('setting values', data)
  setLoggedIn(true);
  setWsData(data);

}

export const onOfferReceived = async (
  conn: WebSocket,
  data: WsDataI, 
  rtcPeerConnection: RTCPeerConnection,
  setRemoteUsername: (val: string) => void
) => {
  // 1. Set offer to remote description 
  // 2. create the answer
  // 3. Set answer to local description

  if (data.offer) {
    await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
    const answer = await rtcPeerConnection.createAnswer();
    rtcPeerConnection.setLocalDescription(answer);
    setRemoteUsername(data.user ?? "");

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

export const onEndCall = (
  rtcPeerConnection: RTCPeerConnection,
  video: HTMLVideoElement, 
  remoteVideo: HTMLVideoElement,
  setRemoteUsername: (val: string) => void
) => {
  // video.srcObject = null;
  remoteVideo.srcObject = null;
  rtcPeerConnection.close();
  rtcPeerConnection.onicecandidate = null;
  setRemoteUsername('');
}

export const handleMessage = (
  conn: WebSocket, 
  data: WsDataI, 
  rtcPeerConnection: RTCPeerConnection, 
  setWsData: (val: WsDataI) => void,
  setLoggedIn: (val: boolean)  => void,
  video: HTMLVideoElement,
  remoteVideo: HTMLVideoElement,
  setRemoteUsername: (val: string)  => void
) => {
  console.log(data);
  console.log(rtcPeerConnection);
  
  switch(data.type) {
    case MESSAGE_TYPES.LOGIN: {
      onLogin(data, setWsData, setLoggedIn);
      break;
    }
    case MESSAGE_TYPES.OFFER: {
      onOfferReceived(conn, data, rtcPeerConnection, setRemoteUsername);
      break;
    }
    case MESSAGE_TYPES.ANSWER: {
      onAnswerReceived(data, rtcPeerConnection);
      break;
    }
    case MESSAGE_TYPES.ICE_CANDIDATE: {
      onIceCandidate(data, rtcPeerConnection);
      break;
    }
    case MESSAGE_TYPES.LEAVE: {
      onEndCall(rtcPeerConnection, video, remoteVideo, setRemoteUsername);
      break;
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

const arrayBufferToBase64 = (buffer: Buffer) => {
  // change into binary and use btoa to change into base64
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

 
const CHUNK_SIZE=16000;
export const sendFileChunks = (file: File, dataChannel: RTCDataChannel, id: number, setProgress: (val: {id: number, progress: number}) => void) => {
  const reader = new FileReader();

  reader.onloadend = (event) => {
    if (event.target?.readyState === FileReader.DONE) {
      let buffer = reader.result, start = 0, end = 0, last = false;
      
      const sendChunk = () => {
        end = start + CHUNK_SIZE;

        // terminating case
        if (end > file.size) {
          end = file.size;
          last = true;
        }

        if (buffer) {
          const progress = Math.floor((end / file.size) * 100);
          setProgress({ id, progress });

          const base64Chunk =  arrayBufferToBase64(buffer.slice(start, end) as Buffer);
          dataChannel.send(base64Chunk);
        }

        if (last === true) {
          dataChannel.send(JSON.stringify({ type: MessageEnum.FILE, shareStatus: ShareStatusEnum.END }))
        } else {
          start = end;
          setTimeout(() => sendChunk(), 100);
        }


      }

      sendChunk();
    }
  }

  reader.readAsArrayBuffer(file);
}

// array of all the base64 string chunks 
const base64ToBlob = (base64fileData: string[], contentType: string) => {
  const byteArrays = [];
  let bytes = [];
  let slice = null;

  for (let i = 0; i <  base64fileData.length; i++) {
    slice = base64fileData[i];
    bytes = new Array(slice.length); 

    for (let j = 0; j < slice.length; j++) {
      bytes[j] = slice.charCodeAt(j);
    }

    byteArrays.push(new Uint8Array(bytes))
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob;
}

export const saveFile = (base64FileData: string[], metadata: FileMetadata) => {
  // change the file to blob
  const blob = base64ToBlob(base64FileData, metadata.fileType);

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = metadata.name;
  link.click();
}