import Note from './Note'

const Notes = ({ notes, notebookName, onSelect }) => {
    return (
        <div className="full-height" style={{ marginTop: "10px", border: "1px black solid" }}>
            <button>Back</button>
            <span>{notebookName}</span>
            {notes.map(note => (
                <Note key={note.id} note={note} />
            ))}
        </div>
    )
}

export default Notes
