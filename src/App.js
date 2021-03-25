import { useState, useEffect } from 'react'
import NoteContent from './components/NoteContent'
import Notes from './components/Notes'
import Sidebar from './components/Sidebar'

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
      <div className="column left">
        <Sidebar />
      </div>
      <div className="column middle">
        <Notes notes={notes} notebookName="Cool Notebook" />
      </div>
      <div className="column right">
        <NoteContent />
      </div>
    </div>
  )
}

export default App
