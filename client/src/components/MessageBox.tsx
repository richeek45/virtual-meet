import { FileMetadata, MessageEnum, fileDataAtom, progressAtom, usernameAtom } from "@/state/atoms";
import Avatar from "./Avatar";
import { Progress } from "./ui/progress";
import { useAtomValue } from "jotai";
import { Download } from "lucide-react";
import { saveFile } from "@/utils/helper";


export const ChatBubble = ({ id, name, type, message, fileMetadata, showProgress 
}: { 
   id: number, name: string, type: MessageEnum, message: string, fileMetadata?: FileMetadata, showProgress: boolean 
}) => {

   return (
   <div className="flex items-start gap-2.5 px-2">
      <Avatar name={name} />
      <div className="flex flex-col w-full leading-1.5 p-3 text-start border-gray-200 bg-gray-100 rounded-e-sm rounded-es-sm dark:bg-gray-700">
         <div className="flex items-center space-x-2 rtl:space-x-reverse"></div>
         { type === MessageEnum.MESSAGE? 
         <p className="text-sm font-normal text-gray-900 dark:text-white">{message}</p>
         :
         (fileMetadata && <FileSend fileMetadata={fileMetadata} showProgress={showProgress} name={name} />)
         }
      </div>
    {/* <button id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
       <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
       </svg>
    </button> */}
    {/* <div id="dropdownDots" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-40 dark:bg-gray-700 dark:divide-gray-600">
       <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
          <li>
             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</a>
          </li>
          <li>
             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Forward</a>
          </li>
          <li>
             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Copy</a>
          </li>
          <li>
             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Report</a>
          </li>
          <li>
             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Delete</a>
          </li>
       </ul>
    </div> */}
 </div>
 )
}


export const FileSend = ({ fileMetadata, showProgress, name } : { fileMetadata: FileMetadata, showProgress: boolean, name: string }) => {
   const progress = useAtomValue(progressAtom);
   const fileData = useAtomValue(fileDataAtom);
   const username = useAtomValue(usernameAtom);
   const receiver = username !== name;
   const sizeInKb = fileMetadata.size / 1024
   const sizeValue = sizeInKb < 1024 ? sizeInKb : (sizeInKb / 1024);
   const unit = sizeInKb < 1024 ? 'Kb' : 'Mb';
   const size = `${sizeValue} ${unit}`;

   const downloadFile = () => {
      saveFile(fileData.currentFile, fileData.fileMetadata);
   }

   return <div>
      <p className="text-sm font-normal text-gray-900 dark:text-white">{fileMetadata.name}</p>
      <p className="text-sm font-normal text-gray-900 dark:text-white">{size}</p>
      <div className='flex flex-col'>
         {showProgress && <div className="flex gap-2 justify-between">
            <Progress value={progress} className="w-[80%]" />
            <div>{progress} %</div>
         </div>}
         {receiver && progress===100 && <button onClick={downloadFile}><Download /></button>}
      </div>

   </div>
}


export default ChatBubble;