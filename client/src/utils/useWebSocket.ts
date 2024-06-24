import { useRef } from "react";
import { handleMessage, isValidJSON } from "./helper";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { usernameAtom, wsDataAtom, defaultWsData, MESSAGE_TYPES, loggedInAtom, remoteUsernameAtom } from "@/state/atoms";

export const sendMessage = (conn: WebSocket, user: string, message: object) => {
  conn.send(JSON.stringify({
    ...message, user
  }));
}

export const setUpPeerConnection = async (
  rtcConnection: RTCPeerConnection, 
  video: HTMLVideoElement,
  remoteVideo: HTMLVideoElement
) => {
  // setup peer connection

  const constraints = {
    // video: {
    //   width: {exact: 1280}, 
    //   height: {exact: 720}
    // },
    video: true,
    audio: true
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream; 

  video.onloadedmetadata = () => {
    video.play();
  }

  stream.getTracks().forEach((track) => {
    console.log('getting tracked ')
    rtcConnection.addTrack(track, stream);
  })

  // rendering other streams on video
  rtcConnection.addEventListener('track', (event) => {
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
      if (localConnection.current) {
        // set remote user
        if (data.type === MESSAGE_TYPES.OFFER) {
          setRemoteUsername(data.user);
        }

        handleMessage(ws, usernameRef.current, data, localConnection.current, setWsData); 
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

  useEffect(() => {
    // this is wrong -> set up should happen only once
    if (wsData.success) {
      setLoggedIn(true);
    }
  }, [wsData])


  return {connection: websocket.current, localConnection: localConnection.current, videoRef, remoteVideoRef }
}

export default useWebSocket;