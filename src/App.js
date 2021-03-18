import { useState, useEffect } from 'react'
import Notes from './components/Notes'

const App = () => {

  const [notes, setNotes] = useState(
    [
      {
        id: 0,
        title: "test 1",
        content: "hiii"
      },
      {
        id: 1,
        title: "test 2",
        content: "heya"
      },
      {
        id: 2,
        title: "test 3",
        content: "hello!"
      }
    ]
  )

  return (
    <div>
      <Notes notes={notes} />
    </div>
  )
}

export default App
