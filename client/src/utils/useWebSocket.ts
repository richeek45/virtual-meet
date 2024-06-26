import { useRef } from "react";
import { getMediaStream, handleMessage, isValidJSON } from "./helper";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { usernameAtom, wsDataAtom, defaultWsData, MESSAGE_TYPES, loggedInAtom, remoteUsernameAtom } from "@/state/atoms";
import useDataChannel from "./useDataChannel";

export const sendMessage = (conn: WebSocket, user: string, message: object) => {
  conn.send(JSON.stringify({
    ...message, user
  }));
}

export const setUpPeerConnection = async (
  constraints: MediaStreamConstraints,
  rtcPeerConnection: RTCPeerConnection, 
  video: HTMLVideoElement,
  remoteVideo: HTMLVideoElement
) => {
  // setup peer connection

  const stream = await getMediaStream(video, constraints)

  stream.getTracks().forEach((track) => {
    console.log('getting tracked ')
    rtcPeerConnection.addTrack(track, stream);
  })

  // rendering other streams on video
  rtcPeerConnection.addEventListener('track', (event) => {
    const [remoteStream] = event.streams;
    if (remoteVideo) {      
      remoteVideo.srcObject = remoteStream;
    }
  })

  return stream;
}

const useWebSocket = ({ port } : { port: number}) => {
  const websocket = useRef<WebSocket | null>(null);
  const [wsData, setWsData] = useAtom(wsDataAtom);
  const username = useAtomValue(usernameAtom);
  const [remoteUsername, setRemoteUsername] = useAtom(remoteUsernameAtom);
  const localConnection = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [_, setLoggedIn] = useAtom(loggedInAtom);
  const usernameRef = useRef(username);
  const remoteUsernameRef = useRef(remoteUsername);

  const { dataChannel } = useDataChannel(localConnection.current);

  useEffect(() => {
    usernameRef.current = username;
    remoteUsernameRef.current = remoteUsername;
  }, [username, remoteUsername])

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const rtcConnection = new RTCPeerConnection();
    localConnection.current = rtcConnection;


    rtcConnection.onicecandidate = (event) => {
      console.log('ice candidate', remoteUsernameRef.current);
      if (event.candidate) {
        sendMessage(ws, remoteUsernameRef.current, {
          type: MESSAGE_TYPES.ICE_CANDIDATE,
          candidate: event.candidate
        })
      }
    }

    ws.onopen = () => {
      console.log('Websocket connection is eshtablished!!');
      setWsData({ ...defaultWsData, error: false });
    }

    ws.onmessage = (message) => {
      // message.data can be string or JSON -> message is a event
      const data = isValidJSON(message?.data) ? JSON.parse(message?.data) : message?.data;
      if (localConnection.current && videoRef.current && remoteVideoRef.current) {
        handleMessage(ws, data, localConnection.current, setWsData, setLoggedIn, videoRef.current, remoteVideoRef.current, setRemoteUsername); 
      }
    }

    websocket.current = ws;

    ws.onerror = (error) => {
      // close the connection
      setWsData({ ...defaultWsData, error: true })
      console.log(error, 'websocke error!!!!!!!!!!!!!!!!');
    }

    return () => {
      ws.close();
      localConnection.current = null;
    }
  }, [])


  return {connection: websocket.current, localConnection: localConnection.current, videoRef, remoteVideoRef, dataChannel }
}

export default useWebSocket;