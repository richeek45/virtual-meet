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
    if (videoRef.current && connection && localConnection) {
      setUpPeerConnection(connection, remoteUsername, localConnection, videoRef.current, remoteVideoRef.current);
    } 
  }

  const handleJoin = async () => {
    if (localConnection && connection) {
      const offer = await localConnection.createOffer();
      await localConnection.setLocalDescription(offer);
      sendMessage(connection, remoteUsername, { type: MESSAGE_TYPES.OFFER, offer })
    }
  }

  console.log(username, 'homepage ');

  return (
    <div>
      <div className='flex flex-col gap-4'>
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
        <video ref={videoRef} autoPlay></video>
        <video id="remote" ref={remoteVideoRef} autoPlay></video>
      </div>

      <video id="local"></video>
    </div>
  )
}

export default App
