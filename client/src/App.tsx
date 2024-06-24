import { Input } from './components/ui/input';
import useWebSocket, { sendMessage, setUpPeerConnection } from './utils/useWebSocket';
import { Button } from './components/ui/button';
import './App.css';
import { MESSAGE_TYPES, loggedInAtom, mediaAtom, remoteUsernameAtom, streamAtom, usernameAtom, wsDataAtom } from './state/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { ProfileIcon } from './components/profileIcon';
import { Mic, MicOff, Paperclip, SendHorizontal, Video, VideoOff } from 'lucide-react';

const iconStyle = `hover:cursor-pointer p-1 border-2 border-slate-300 rounded-md shadow-lg drop-shadow-md bg-white`;

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
  const { connection, localConnection, videoRef, remoteVideoRef } = useWebSocket({port: 8080});
  const wsData = useAtomValue(wsDataAtom);
  const [stream, setStream] = useAtom(streamAtom);
  const [mediaToggle, setMediaToggle] = useAtom(mediaAtom); 

  console.log(loggedIn, wsData);


  const handleLogin = () => {
    const loginInfo = {
      type: MESSAGE_TYPES.LOGIN
    }
    if (connection) {
      sendMessage(connection, username, loginInfo);
    }
  }

  const handleConnect = async () => {
    if (videoRef.current && remoteVideoRef.current && connection && localConnection) {
      const stream = await setUpPeerConnection(localConnection, videoRef.current, remoteVideoRef.current);
      setStream(stream);
    } 
  }

  const handleJoin = async () => {
    if (localConnection && connection) {
      const offer = await localConnection.createOffer();
      await localConnection.setLocalDescription(offer);
      sendMessage(connection, remoteUsername, { type: MESSAGE_TYPES.OFFER, offer })
    }
  }

  const handleAudioToggle = () => {
    console.log('audio toggled = ', mediaToggle.audio)
    stream.getAudioTracks().forEach((track: { enabled: boolean; }) => {
      track.enabled = !track.enabled
      setMediaToggle({ audio: track.enabled, video: mediaToggle.video });
    });
  }

  const handleSendMessage = () => {
    console.log('send')
  }

  const handleVideoToggle = () => {
    console.log('Mute Video!!', mediaToggle.video);
    stream.getVideoTracks().forEach((track: { enabled: boolean; }) => {
      track.enabled = !track.enabled;
      setMediaToggle({ video: track.enabled, audio: mediaToggle.audio });
    });
  }

  return (
    <div className='flex justify-between h-screen p-10 gap-10'>
      <div className='flex flex-col'>

        <div className='flex gap-4 w-full justify-around'>
          <div className='flex w-2/6 gap-4'>
            <Input type='text' placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button onClick={handleLogin} >Login</Button>
            {loggedIn && <><ProfileIcon /><p>{username}</p></>}
            <Button onClick={handleConnect} >Connect</Button>
          </div>
          <div className='flex w-2/6 gap-4'>
            <Input type='text' placeholder="" value={remoteUsername} onChange={(e) => setRemoteUsername(e.target.value)} />
            <Button onClick={handleJoin} >Other User</Button>
            {loggedIn && <ProfileIcon />}
          </div>
        </div>
        
        <div className='flex justify-between h-[80%] border-black border-2'>
          <div>
            <video className='h-full object-cover' ref={videoRef} autoPlay></video>
          </div>
          <div>
            <video className='h-full object-cover' ref={remoteVideoRef} autoPlay></video>
          </div>
        </div>

        <div className='border-black border-2 h-12 flex justify-center'>
          <div className='flex justify-center items-center shadow-lg bg-slate-200 w-2/3 gap-4'>
            <VideoBtn handleVideoToggle={handleVideoToggle} videoEnabled={mediaToggle.video} />
            <AudioBtn handleAudioToggle={handleAudioToggle} audioEnabled={mediaToggle.audio} />
          </div>
        </div>

      </div>


      <div className='flex flex-col w-[30%] border-solid border-black border-2 rounded-md p-6 gap-2'>
        Messages
        <div className='h-[90%] border-2 border-black rounded-sm'>
          Message Rendering Box
        </div>
        <Input placeholder='Send a message' />
        <Paperclip />
        <SendHorizontal onClick={handleSendMessage} />
      </div>
    </div>
  )
}

export default App
