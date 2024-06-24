import { Input } from './components/ui/input';
import useWebSocket, { sendMessage, setUpPeerConnection } from './utils/useWebSocket';
import { Button } from './components/ui/button';
import './App.css';
import { MESSAGE_TYPES, loggedInAtom, remoteUsernameAtom, usernameAtom, wsDataAtom } from './state/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { ProfileIcon } from './components/profileIcon';

function App() {
  const [username, setUsername] = useAtom(usernameAtom);
  const [remoteUsername, setRemoteUsername] = useAtom(remoteUsernameAtom);
  const loggedIn = useAtomValue(loggedInAtom);
  const { connection, localConnection, videoRef, remoteVideoRef } = useWebSocket({port: 8080});
  const wsData = useAtomValue(wsDataAtom);
  console.log(loggedIn, wsData);

  const handleLogin = () => {
    const loginInfo = {
      type: MESSAGE_TYPES.LOGIN
    }
    if (connection) {
      sendMessage(connection, username, loginInfo);
    }
  }

  const handleConnect = () => {
    if (videoRef.current && remoteVideoRef.current && connection && localConnection) {
      setUpPeerConnection(localConnection, videoRef.current, remoteVideoRef.current);
    } 
  }

  const handleJoin = async () => {
    if (localConnection && connection) {
      const offer = await localConnection.createOffer();
      await localConnection.setLocalDescription(offer);
      sendMessage(connection, remoteUsername, { type: MESSAGE_TYPES.OFFER, offer })
    }
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

      </div>
      <div className='flex flex-col w-[30%] border-solid border-black border-2 rounded-md p-6 gap-2'>
        Messages
        <div className='h-[90%] border-2 border-black rounded-sm'>
          Message Rendering Box
        </div>
        <Input placeholder='Send a message' />
      </div>
    </div>
  )
}

export default App
