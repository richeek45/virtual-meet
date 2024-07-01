import { Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MessageEnum, MessageI, ShareStatusEnum, messageAtom, progressAtom, usernameAtom } from "@/state/atoms";
import { sendFileChunks } from "@/utils/helper";


const FileShare = ({ dataChannel } : { dataChannel: RTCDataChannel}) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [messages, setMessages] = useAtom(messageAtom);
  const username = useAtomValue(usernameAtom);
  const setProgress = useSetAtom(progressAtom);

  const openFilePrompt = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event) => {
      if (input.files) {
        // start sending with the progress bar
        let files = Array.from(input.files);
        setFiles(files);
        const lastId = messages[messages.length - 1]?.id ?? 0;
        const fileMetadata = { name: files[0].name, size: files[0].size, fileType: files[0].type };
        const newMessage: MessageI = { id: lastId + 1, type: MessageEnum.FILE, shareStatus: ShareStatusEnum.START, user: username, fileMetadata: fileMetadata };

        setMessages([ ...messages, newMessage])
        // start sending in chunks

        if (files.length > 0) {
          dataChannel.send(JSON.stringify(newMessage))
        }

        sendFileChunks(files[0], dataChannel, newMessage.id, setProgress);

      }
    };
    input.click();
  }


  return (<div>
    <Button variant='ghost' size='sm' onClick={openFilePrompt}><Paperclip /></Button>
  </div>)
}


export default FileShare;