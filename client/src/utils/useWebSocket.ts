import { useRef, useState } from "react";
import { getMediaStream, handleMessage, isValidJSON, onLogin } from "./helper";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { usernameAtom, wsDataAtom, defaultWsData, MESSAGE_TYPES, loggedInAtom, remoteUsernameAtom, streamAtom } from "@/state/atoms";
import useDataChannel from "./useDataChannel";
import { ENV_VARIABLES } from "@/env";
import { stunServerList, turnServerList } from "./serverList";

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
    rtcPeerConnection.addTrack(track, stream);
  })

  // rendering other streams on video
  rtcPeerConnection.addEventListener('track', (event) => {
    const [remoteStream] = event.streams;
    console.log(remoteStream, 'getting tracks')
    if (remoteVideo) {      
      remoteVideo.srcObject = remoteStream;
      video.classList.replace('w-full', 'w-[50%]');
      remoteVideo.classList.replace('hidden', 'block');
    }
  })

  return stream;
}

const useWebSocket = ({ port } : { port: number}) => {
  const websocket = useRef<WebSocket | null>(null);
  const [wsData, setWsData] = useAtom(wsDataAtom);
  const username = useAtomValue(usernameAtom);
  const [remoteUsername, setRemoteUsername] = useAtom(remoteUsernameAtom);
  const rtcPeerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [_, setLoggedIn] = useAtom(loggedInAtom);
  const [stream, setStream] = useAtom(streamAtom);
  const usernameRef = useRef(username);
  const remoteUsernameRef = useRef(remoteUsername);
  const [connection, setConnection] = useState(rtcPeerConnectionRef.current);

  const { dataChannel } = useDataChannel(connection);

  const setLocalConnection = (val: RTCPeerConnection | null) => {
    rtcPeerConnectionRef.current = val;
  }


  const handleConnect = async () => {
    const connection = websocket.current;

    const configuration = { 
      iceServers:[
        // { urls: turnServerList,
        //   username: ENV_VARIABLES.TURN_USERNAME,
        //   credential: ENV_VARIABLES.TURN_CREDENTIAL
        // },
        {urls: stunServerList}
      ],
      iceCandidatePoolSize: 10
    }

    const rtcPeerConnection = new RTCPeerConnection(configuration);
    rtcPeerConnectionRef.current = rtcPeerConnection;
    setConnection(rtcPeerConnection);

    rtcPeerConnection.onicecandidate = (event) => {
      if (event.candidate && websocket.current) {
        sendMessage(websocket.current, remoteUsernameRef.current, {
          type: MESSAGE_TYPES.ICE_CANDIDATE,
          candidate: event.candidate
        })
      }
    }

    if (videoRef.current && remoteVideoRef.current && connection) {
      const stream = await setUpPeerConnection({video: true, audio: true }, rtcPeerConnection, videoRef.current, remoteVideoRef.current);
      setStream(stream);
    } 

  }


  useEffect(() => {
    usernameRef.current = username;
    remoteUsernameRef.current = remoteUsername;
  }, [username, remoteUsername])

  useEffect(() => {
    const configuration = { 
      iceServers:[
        // { urls: turnServerList,
        //   username: ENV_VARIABLES.TURN_USERNAME,
        //   credential: ENV_VARIABLES.TURN_CREDENTIAL
        // },
        {urls: stunServerList}
      ],
      iceCandidatePoolSize: 10
    }
    const ws = new WebSocket(ENV_VARIABLES.WEBSOCKET);
    // const rtcConnection = new RTCPeerConnection(configuration);
    // localConnection.current = rtcConnection;
    // setConnection(rtcConnection);


    // rtcConnection.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     sendMessage(ws, remoteUsernameRef.current, {
    //       type: MESSAGE_TYPES.ICE_CANDIDATE,
    //       candidate: event.candidate
    //     })
    //   }
    // }

    ws.onopen = () => {
      console.log('Websocket connection is eshtablished!!');
      setWsData({ ...defaultWsData, error: false });
    }

    ws.onmessage = (message) => {
      // message.data can be string or JSON -> message is a event
      const data = isValidJSON(message?.data) ? JSON.parse(message?.data) : message?.data;
      if (data.type === MESSAGE_TYPES.LOGIN) {
        onLogin(data, setWsData, setLoggedIn);
      }
      if (rtcPeerConnectionRef.current && videoRef.current && remoteVideoRef.current) {
        handleMessage(ws, data, rtcPeerConnectionRef.current, videoRef.current, remoteVideoRef.current, setRemoteUsername); 
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
      rtcPeerConnectionRef.current = null;
    }
  }, [])


  return { 
    connection: websocket.current,
    localConnection: rtcPeerConnectionRef.current, 
    handleConnect, 
    setLocalConnection, 
    videoRef, 
    remoteVideoRef, 
    dataChannel
  }
}

export default useWebSocket;