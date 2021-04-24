import { useState, useEffect } from 'react'
import NoteContent from './components/NoteContent'
import Notes from './components/Notes'
import Sidebar from './components/Sidebar'
import Login from './components/Login'

const App = () => {

  const [token, setToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      <Login loggedIn={loggedIn} setToken={setToken} setLoggedIn={setLoggedIn} />
    </div>
  )
}

export default App
