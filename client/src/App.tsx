import { useState } from 'react';
import { Input } from './components/ui/input';
import useWebSocket, { sendMessage } from './utils/useWebSocket';
import { Button } from './components/ui/button';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const { connection } = useWebSocket({port: 8080});

  const handleLogin = () => {
    const loginInfo = {
      type: 'login'
    }
    if (connection) {
      sendMessage(connection, username, loginInfo);
    }
  }

  return (
    <div>
      <Input type='text' placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Button onClick={handleLogin} >Login</Button>
      <video id="local"></video>
    </div>
  )
}

export default App
