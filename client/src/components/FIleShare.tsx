import { Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAtom } from "jotai";
import { MessageEnum, MessageI, messageAtom } from "@/state/atoms";


const FileShare = () => {
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
        const newMessage: MessageI = { id: 1111, type: MessageEnum.FILE, message: 'files', user: 'Richeek', files };
        setMessages([ ...messages, newMessage])
      }
    };
    input.click();
  }


  return (<div>
    <Button variant='ghost' size='sm' onClick={openFilePrompt}><Paperclip /></Button>
  </div>)
}


export default FileShare;