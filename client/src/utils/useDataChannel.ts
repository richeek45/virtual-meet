import { FileMetadata, MessageEnum, MessageI, ShareStatusEnum, messageAtom, progressAtom, remoteUsernameAtom } from "@/state/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { saveFile } from "./helper";


const useDataChannel = (rtcPeerConnection: RTCPeerConnection | null) => {
  const [messages, setMessages] = useAtom(messageAtom);
  const remoteUsername = useAtomValue(remoteUsernameAtom);
  const [progress, setProgress] = useAtom(progressAtom);
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
      let currentFile: string[] = []; // store the received chunks
      let fileMetadata: FileMetadata | null = null;

      dataChannel.current = rtcPeerConnection.createDataChannel("chat", dataChannelOptions);
      rtcPeerConnection.ondatachannel = (event) => {
        const channel = event.channel;
    
        channel.onopen = () => {
          console.log('datachannel: opened');
        }
    
        channel.onmessage = (event) => {
          let data: MessageI = event.data; 
          console.log('message: = ', data);

          try {
            data = JSON.parse(event.data);

            if (data.type === MessageEnum.MESSAGE) {
              setMessages([ ...messageR.current, data]);
            }
            if (data.type === MessageEnum.FILE) {
              console.log('file getting here', fileMetadata, data?.shareStatus)
              // receive file in chunks and add progress bar
              if (data.shareStatus === ShareStatusEnum.START && data.metadata) {
                currentFile = [];
                fileMetadata = data.metadata;
              }
              if (data.shareStatus === ShareStatusEnum.END && fileMetadata) {
                console.log('ending')
                saveFile(currentFile, fileMetadata);
              }
            }
          } catch (err) {
            if (typeof data === "string") {
              // add it to the buffer
              currentFile.push(atob(data));

              /// add the progress logic
            }
          }
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