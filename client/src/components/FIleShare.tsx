import { Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAtom } from "jotai";
import { MessageEnum, MessageI, ShareStatusEnum, messageAtom } from "@/state/atoms";
import { sendFileChunks } from "@/utils/helper";


const FileShare = ({ dataChannel } : { dataChannel: RTCDataChannel}) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [messages, setMessages] = useAtom(messageAtom);

  const openFilePrompt = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event) => {
      if (input.files) {
        // start sending with the progress bar
        let files = Array.from(input.files);
        console.log(files);
        setFiles(files);
        const fileMetadata = { name: files[0].name, size: files[0].size, fileType: files[0].type };
        const newMessage: MessageI = { id: 1111, type: MessageEnum.FILE, shareStatus: ShareStatusEnum.START, user: 'Richeek', metadata: fileMetadata };

        setMessages([ ...messages, newMessage])
        // start sending in chunks

        if (files.length > 0) {
          dataChannel.send(JSON.stringify(newMessage))
        }

        sendFileChunks(files[0], dataChannel);

      }
    };
    input.click();
  }


  return (<div>
    <Button variant='ghost' size='sm' onClick={openFilePrompt}><Paperclip /></Button>
  </div>)
}


export default FileShare;