import { useRef, useState } from "react";
import { getMediaStream, handleMessage, isValidJSON } from "./helper";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { usernameAtom, wsDataAtom, defaultWsData, MESSAGE_TYPES, loggedInAtom, remoteUsernameAtom } from "@/state/atoms";
import useDataChannel from "./useDataChannel";
import { ENV_VARIABLES } from "@/env";

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
    console.log('local tracks', track);
    rtcPeerConnection.addTrack(track, stream);
  })

  // rendering other streams on video
  rtcPeerConnection.addEventListener('track', (event) => {
    const [remoteStream] = event.streams;
    console.log(remoteStream, remoteVideo, 'getting tracks')
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
  const [connection, setConnection] = useState(localConnection.current);

  const { dataChannel } = useDataChannel(connection);

  useEffect(() => {
    usernameRef.current = username;
    remoteUsernameRef.current = remoteUsername;
  }, [username, remoteUsername])

  useEffect(() => {
    const configuration = {
      iceServers:[
          {
              urls:[
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
              ]
          }
      ]
  }
    const ws = new WebSocket(ENV_VARIABLES.WEBSOCKET);
    const rtcConnection = new RTCPeerConnection(configuration);
    localConnection.current = rtcConnection;
    setConnection(rtcConnection);


    rtcConnection.onicecandidate = (event) => {
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
        handleMessage(ws, data, rtcConnection, setWsData, setLoggedIn, videoRef.current, remoteVideoRef.current, setRemoteUsername); 
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