import { MessageI, messageAtom, remoteUsernameAtom } from "@/state/atoms";
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
          console.log('message: = ', event.data);
          const lastId = messageR.current[messageR.current.length - 1]?.id ?? 0;
          const newMessage = { id: lastId + 1, user: remoteUsernameRef.current, message: event.data}
          setMessages([ ...messageR.current, newMessage]);
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