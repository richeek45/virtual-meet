import { Input } from './components/ui/input';
import useWebSocket, { sendMessage } from './utils/useWebSocket';
import { Button } from './components/ui/button';
import './App.css';
import { MESSAGE_TYPES, loggedInAtom, usernameAtom, wsDataAtom } from './state/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { ProfileIcon } from './components/profileIcon';
import { useEffect } from 'react';

function App() {
  const [username, setUsername] = useAtom(usernameAtom);
  const [loggedIn, setLoggedIn] = useAtom(loggedInAtom);
  const { connection } = useWebSocket({port: 8080});
  const wsData = useAtomValue(wsDataAtom);

  console.log(loggedIn, wsData);

  useEffect(() => {
    if (wsData.success) {
      setLoggedIn(true);
    }
  }, [wsData])

  const handleLogin = () => {
    const loginInfo = {
      type: MESSAGE_TYPES.LOGIN
    }
    if (connection) {
      sendMessage(connection, username, loginInfo);
    }
  }

  return (
    <div>
      <div>
        <Input type='text' placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} />
        {loggedIn && <ProfileIcon />}
      </div>
      <Button onClick={handleLogin} >Login</Button>
      <video id="local"></video>
    </div>
  )
}

export default App
