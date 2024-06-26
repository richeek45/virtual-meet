import { FileMetadata, MessageEnum, MessageI, ShareStatusEnum, fileDataAtom, messageAtom, progressAtom, remoteUsernameAtom } from "@/state/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { saveFile } from "./helper";


const useDataChannel = (rtcPeerConnection: RTCPeerConnection | null) => {
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
    if (rtcPeerConnection) {
      const dataChannelOptions = { ordered: true };
      let currentFile: string[] = []; // store the received chunks
      let fileMetadata: FileMetadata | null = null;
      let currentFileSize = 0;
      let lastMessage: MessageI | null = null;

      dataChannel.current = rtcPeerConnection.createDataChannel("chat", dataChannelOptions);
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
              lastMessage = data;
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
                if (lastMessage?.id) {
                  setProgress({ progress, id: lastMessage.id});
                }
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
  }, [rtcPeerConnection])

  return {  dataChannel: dataChannel.current };
}


export default useDataChannel;