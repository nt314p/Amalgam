import React from 'react'

const Note = ({ note, onSelect }) => {
    return (
        <div style={{ border: "1px black solid", marginBottom: "-1px", padding: "10px" }}>
            <h4>{note.title}</h4>
            <p>{note.content}</p>
        </div>
    )
}

export default Note
