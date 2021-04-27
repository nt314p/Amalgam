import { useState } from 'react';
import Login from './components/Login';

const App = () => {

  const [token, setToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      <Login signUp={false} loggedIn={loggedIn} setToken={setToken} setLoggedIn={setLoggedIn} />
    </div>
  )
}

export default App
