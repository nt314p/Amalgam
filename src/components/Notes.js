import Note from './Note'

const Notes = ({ notes, onSelect }) => {
    return (
        <>
            {notes.map(note => (
                <Note key={note.id} note={note} />
            ))}
        </>
    )
}

export default Notes
