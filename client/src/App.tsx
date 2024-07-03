import { Input } from './components/ui/input';
import useWebSocket, { sendMessage, setUpPeerConnection } from './utils/useWebSocket';
import { Button } from './components/ui/button';
import './App.css';
import { MESSAGE_TYPES, MessageEnum, loggedInAtom, mediaAtom, messageAtom, progressAtom, remoteUsernameAtom, streamAtom, usernameAtom } from './state/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { LogIn, Mic, MicOff, Paperclip, Phone, SendHorizontal, Video, VideoOff } from 'lucide-react';
import { getMediaStream, removeTracks } from './utils/helper';
import { useEffect, useRef, useState } from 'react';
import { ChatBubble } from './components/MessageBox';
import Avatar from './components/Avatar';
import FileShare from './components/FIleShare';

const iconStyle = `hover:cursor-pointer p-1 border-2 border-slate-300 rounded-md shadow-lg drop-shadow-md bg-white`;
const inputStyle = `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`

const VideoBtn = ({ videoEnabled, handleVideoToggle} : {videoEnabled: boolean, handleVideoToggle: () => void}) => {

  if (videoEnabled) {
    return <Video onClick={handleVideoToggle} size={40} strokeWidth={1.5} className={iconStyle} />
  }

  return  <VideoOff onClick={handleVideoToggle} size={40} strokeWidth={1.5} className={iconStyle} />;
}

const AudioBtn = ({ audioEnabled, handleAudioToggle} : { audioEnabled: boolean, handleAudioToggle: () => void }) => {

  if (audioEnabled) {
    return <Mic onClick={handleAudioToggle} size={40} className={iconStyle} />
  }

  return <MicOff onClick={handleAudioToggle} size={40} className={iconStyle} />;
}


function App() {
  const [username, setUsername] = useAtom(usernameAtom);
  const [remoteUsername, setRemoteUsername] = useAtom(remoteUsernameAtom);
  const loggedIn = useAtomValue(loggedInAtom);
  const { connection, localConnection, setLocalConnection, handleConnect, videoRef, remoteVideoRef, dataChannel } = useWebSocket({port: 8081 });
  const [stream, setStream] = useAtom(streamAtom);
  const [mediaToggle, setMediaToggle] = useAtom(mediaAtom); 
  const [messages, setMessages] = useAtom(messageAtom);
  const [messageSend, setMessageSend] = useState('');
  const messageRef = useRef<HTMLDivElement | null>(null);
  const { id } = useAtomValue(progressAtom);

  useEffect(() => {
    if (messageRef.current) {
        messageRef.current.scrollTo(0, messageRef.current.scrollHeight);
      }
  }, [messages]);


  const handleLogin = () => {
    const loginInfo = {
      type: MESSAGE_TYPES.LOGIN
    }
    if (connection) {
      sendMessage(connection, username, loginInfo);
    }
  }


  const handleJoin = async () => {
    if (localConnection && connection) {
      const offer = await localConnection.createOffer();
      await localConnection.setLocalDescription(offer);
      sendMessage(connection, remoteUsername, { type: MESSAGE_TYPES.OFFER, offer })
    }
  }

  const handleEndCall = () => {
    if (localConnection && connection && videoRef.current && remoteVideoRef.current) {
      sendMessage(connection, username, { type: MESSAGE_TYPES.LEAVE });
      videoRef.current.srcObject = null;
      remoteVideoRef.current.srcObject = null;
      localConnection.close();
      localConnection.onicecandidate = null;
      setLocalConnection(null);
      setRemoteUsername('');
      removeTracks(stream);
      setStream(null as unknown as MediaStream);
      // end with a message for ending the call!
      // back to homesceen
    }
  }

  const handleAudioToggle = () => {
    stream.getAudioTracks().forEach((track: { enabled: boolean; }) => {
      track.enabled = !track.enabled
      setMediaToggle({ audio: track.enabled, video: mediaToggle.video });
    });
  }

  const handleSendMessage = () => {
    if (dataChannel) {
      const lastId = messages[messages.length - 1]?.id ?? 0;
      const newMessage = {id: lastId + 1, user: username, type: MessageEnum.MESSAGE, message: messageSend };
      dataChannel.send(JSON.stringify(newMessage));
      setMessages([ ...messages, newMessage]);
      setMessageSend('');
    }
  }

  const replaceVideoTrack = (peerConnection: RTCPeerConnection, track: MediaStreamTrack) => {
    for (const s of peerConnection.getSenders()) {
      if (s.track == null || s.track.kind === "video") {
          s.replaceTrack(track);
      }
    }

    for (const t of peerConnection.getTransceivers()) {
      if (t.sender.track?.kind == null ||
          t.sender.track.kind === "video") {
          t.direction = "sendrecv";
      }
    }
  }

  const handleVideoToggle = async () => {
    if (localConnection && videoRef.current) {
      // 1. Disable Video -> remove video tracks and add audio tracks again
      if (mediaToggle.video) {
        stream.getVideoTracks().forEach((track) => {  
          track.enabled = !track.enabled;
        });
  
        removeTracks(stream);

        setMediaToggle({ video: false, audio: mediaToggle.audio });

      } else {
        // 2. Enable Video -> Add video tracks again   
        const video = videoRef.current;

        const stream = await getMediaStream(video, {audio: true, video: true })
        stream.getVideoTracks().forEach((track) => {
          replaceVideoTrack(localConnection, track);
        })

        setStream(stream);
        setMediaToggle({ video: true, audio: mediaToggle.audio });
      }
    }
  }

  return (
    <div className='flex justify-between h-screen p-10 gap-10 w-full'>
      <div className='flex flex-col gap-2 w-full'>

        <div className='flex gap-4 w-full justify-around'>
          <div className='flex gap-4'>
            <Input disabled={loggedIn} type='text' placeholder="Enter your name..." value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button  className='border-2' onClick={handleLogin} ><LogIn /></Button>
            <Button onClick={handleConnect} ><Video /></Button>
          </div>
          <div className='flex w-2/6 gap-4'>
            <Input type='text' placeholder="Enter other user's name..." value={remoteUsername} onChange={(e) => setRemoteUsername(e.target.value)} />
            <Button onClick={handleJoin} >Connect</Button>
          </div>
            <div>{loggedIn && <><Avatar name={username} /></>}</div>
        </div>
        
        <div className='flex justify-between h-[80%] w-[100%] border-slate-400 border-2 rounded-md'>
          <video id='local' className='h-full w-full object-cover' muted={true} ref={videoRef} autoPlay></video>
          <div>
            <video id='remote' className='h-full object-cover hidden' ref={remoteVideoRef} autoPlay></video>
          </div>
        </div>

        <div className='h-12 flex justify-center border-slate-500 drop-shadow-md'>
          <div className='flex justify-center items-center shadow-lg bg-slate-200 w-2/3 gap-4'>
            <VideoBtn handleVideoToggle={handleVideoToggle} videoEnabled={mediaToggle.video} />
            <AudioBtn handleAudioToggle={handleAudioToggle} audioEnabled={mediaToggle.audio} />
            <Phone onClick={handleEndCall} size={40} fill='white' strokeWidth='1.1' className={`${iconStyle} bg-red-500 `} />
          </div>
        </div>

      </div>

      <div className='flex flex-col border-solid border-slate-300 border-2 drop-shadow-md rounded-md p-6 gap-2'>
        Messages
        <div id="message" ref={messageRef} className='h-[90%] border-2 border-slate-300 rounded-sm overflow-scroll scrollbar-hide flex flex-col gap-2'>
          {messages.map(data => {
            const showProgress = data.type === MessageEnum.FILE && data.id === id;
            return <ChatBubble 
              key={data.id} name={data.user} 
              type={data.type} 
              message={data.message ?? ''} 
              id={data.id} 
              fileMetadata={data.fileMetadata} 
              showProgress={showProgress}
            />
          })}
        </div>
        <div className={`flex drop-shadow-md ${inputStyle}`}>
          <input value={messageSend} className='outline-none w-[70%]' placeholder='Send a message' onChange={(event) => setMessageSend(event.target.value)} />
          <div className='flex justify-center items-center'>
            <FileShare dataChannel={dataChannel} />
            <Button variant='ghost' size='sm' onClick={handleSendMessage}><SendHorizontal size={30} /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
