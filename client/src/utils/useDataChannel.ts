import { FileMetadata, MessageEnum, MessageI, ShareStatusEnum, fileDataAtom, messageAtom, progressAtom, remoteUsernameAtom } from "@/state/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useEffect, useRef } from "react";
import { saveFile } from "./helper";


const useDataChannel = (localConnection: MutableRefObject<RTCPeerConnection | null>) => {
  const [messages, setMessages] = useAtom(messageAtom);
  const remoteUsername = useAtomValue(remoteUsernameAtom);
  const [progress, setProgress] = useAtom(progressAtom);
  const dataChannel = useRef(null as unknown as RTCDataChannel);
  const setFileData = useSetAtom(fileDataAtom);

  const messageR = useRef<MessageI[]>([]);
  const remoteUsernameRef = useRef('');

  useEffect(() => {
    messageR.current = messages;
    remoteUsernameRef.current = remoteUsername;
  }, [messages, remoteUsername])

  useEffect(() => {
    const rtcPeerConnection = localConnection.current;
    console.log(rtcPeerConnection, 'test');
    if (rtcPeerConnection) {
      const dataChannelOptions = { ordered: true };
      let currentFile: string[] = []; // store the received chunks
      let fileMetadata: FileMetadata | null = null;
      let currentFileSize = 0;

      dataChannel.current = rtcPeerConnection.createDataChannel("chat", dataChannelOptions);
      console.log(dataChannel.current, 'datachannel');
      rtcPeerConnection.ondatachannel = (event) => {
        const channel = event.channel;
    
        channel.onopen = () => {
          console.log('datachannel: opened');
        }
    
        channel.onmessage = (event) => {
          let data: MessageI = event.data; 
          // console.log('message: = ', data);

          try {
            data = JSON.parse(event.data);

            if (data.type === MessageEnum.MESSAGE) {
              setMessages([ ...messageR.current, data]);
            }
            if (data.type === MessageEnum.FILE) {
              // receive file in chunks and add progress bar
              if (data.shareStatus === ShareStatusEnum.START && data.fileMetadata) {
                currentFile = [];
                fileMetadata = data.fileMetadata;
                currentFileSize = 0;
                setMessages([ ...messageR.current, data ]);
              }
              if (data.shareStatus === ShareStatusEnum.END && fileMetadata) {
                setFileData({fileMetadata, currentFile})
              }
            }
          } catch (err) {
            if (typeof data === "string") {
              // add it to the buffer
              currentFile.push(atob(data));

              /// add the progress logic
              if (fileMetadata) {
                currentFileSize += currentFile[currentFile.length - 1].length;
                const progress = Math.floor((currentFileSize/fileMetadata.size) * 100);
                setProgress(progress);
              }
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
  }, [localConnection.current])

  console.log(dataChannel.current, localConnection, 'outside');
  return {  dataChannel: dataChannel.current };
}


export default useDataChannel;