import { MessageEnum, MessageI, messageAtom, remoteUsernameAtom } from "@/state/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";


const useDataChannel = (rtcPeerConnection: RTCPeerConnection | null) => {
  const [messages, setMessages] = useAtom(messageAtom);
  const remoteUsername = useAtomValue(remoteUsernameAtom);
  const dataChannel = useRef(null as unknown as RTCDataChannel);

  const messageR = useRef<MessageI[]>([]);
  const remoteUsernameRef = useRef('');

  useEffect(() => {
    messageR.current = messages;
    remoteUsernameRef.current = remoteUsername;
  }, [messages, remoteUsername])

  useEffect(() => {
    if (rtcPeerConnection) {
      const dataChannelOptions = { ordered: true };

      dataChannel.current = rtcPeerConnection.createDataChannel("chat", dataChannelOptions);
      rtcPeerConnection.ondatachannel = (event) => {
        const channel = event.channel;
    
        channel.onopen = () => {
          console.log('datachannel: opened');
        }
    
        channel.onmessage = (event) => {
          const data: MessageI = JSON.parse(event.data); 
          console.log('message: = ', data);
          setMessages([ ...messageR.current, data]);
        }
    
        channel.onclose = () => {
          console.log('datachannel: closed');
    
        }
    
        channel.onerror = () => {
          console.log('datachannel: error');
        }
    
      }
  
    }
  }, [rtcPeerConnection])


  return {  dataChannel: dataChannel.current };
}


export default useDataChannel;