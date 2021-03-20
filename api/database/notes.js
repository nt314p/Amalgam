const mongoose = require("mongoose");
const Note = require("../models/note");
const NoteContent = require("../models/noteContent");
const Notebooks = require("./notebooks");

async function getNoteContentById(id) {
    return await NoteContent.findById(id);
}

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
            content: noteContent,
            owner: noteData.accountId,
            notebook: noteData.notebookId,
            created: Date.now(),
            tags: noteData.tags,
            starred: noteData.starred,
            edited: Date.now()
        });

        noteContent.note = note;

        await noteContent.save();
        const createdNote = await note.save();

        return createdNote;
    },

    getById: async (id, populate) => {
        let note = await Note.findById(id);
        if (!populate)
            return note;
        return await note.populate("content").execPopulate();
    },

    updateById: async (id, newNote) => {
        let noteContent = await getNoteContentById(id);
        noteContent.content = newNote.content;
        await noteContent.save();

        let oldNote = await this.getById(id);
        oldNote.title = newNote.title;
        oldNote.tags = newNote.tags;
        oldNote.starred = newNote.starred;
        oldNote.edited = Date.now();

        return await oldNote.save();
    },

    deleteById: async (id) => {
        let deletedNote = await this.getById(id);
        await Notebooks.removeNote(deletedNote.notebook, deletedNote._id);
        await Note.findByIdAndDelete(id);
    },

    setNotebook: async (noteId, notebookId) => {
        let note = await this.getById(noteId);
        note.notebook = notebookId;
        await note.save();
    },

    hasNotebook: async (noteId) => {
        let note = await this.getById(noteId);
        return note.notebook != undefined;
    }
};

