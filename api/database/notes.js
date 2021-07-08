const mongoose = require("mongoose");
const Note = require("../models/note");
const NoteContent = require("../models/noteContent");
const Notebooks = require("./notebooks");

module.exports = {
    exists: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id))
            return false;
        return await Note.exists({ _id: id });
    },

    create: async(noteData) => {
        const noteContent = new NoteContent({
            _id: new mongoose.Types.ObjectId(),
            content: noteData.content,
            owner: noteData.accountId
        });

        const note = new Note({
            _id: new mongoose.Types.ObjectId(),
            title: noteData.title,
            content: noteContent._id,
            owner: noteData.accountId,
            notebook: noteData.notebookId,
            created: Date.now(),
            tags: noteData.tags,
            starred: noteData.starred,
            edited: Date.now()
        });

        noteContent.note = note._id;
        await noteContent.save();

        const createdNote = await note.save();
        return createdNote;
    },

    getById: async (id, populate) => {
        let note = await Note.findById(id);
        if (populate !== true) {
            note.content = undefined;
            return note;
        }
        
        note = await note.populate("content").execPopulate();
        note = note.toObject();
        note.content = note.content.content;
        return note;
    },

    updateById: async (id, newNote) => {
        let note = await Note.findById(id);
        let noteContent = await NoteContent.findById(note.content);
        noteContent.content = newNote.content;
        await noteContent.save();

        let oldNote = await Note.findById(id);
        oldNote.title = newNote.title;
        oldNote.tags = newNote.tags;
        oldNote.starred = newNote.starred;
        oldNote.edited = Date.now();

        return await oldNote.save();
    },

    deleteById: async (id) => {
        let deletedNote = await Note.findById(id);
        await NoteContent.findByIdAndDelete(deletedNote.content);
        await deletedNote.delete();
    },

    setNotebook: async (noteId, notebookId) => {
        let note = await Note.findById(noteId);
        note.notebook = notebookId;
        await note.save();
    },

    hasNotebook: async (noteId) => {
        let note = await Note.findById(noteId);
        return note.notebook != undefined;
    }
};

