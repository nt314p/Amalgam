const mongoose = require("mongoose");
const Notebook = require("../models/notebook");
const Notes = require("./notes");

async function addNote(notebookId, noteId) {
    let notebook = await Notebook.findById(notebookId);
    notebook.notes.push(noteId);
    await notebook.save();
    await Notes.setNotebook(noteId, notebookId);
}

async function removeNote(notebookId, noteId) {
    let notebook = await Notebook.findById(notebookId);
    notebook.notes.pull(noteId);
    await notebook.save();
    await Notes.setNotebook(noteId, undefined);
}

module.exports = {
    exists: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return false;
        return await Notebook.exists({ _id: id });
    },

    create: async (notebookName, accountId) => {
        let notebook = new Notebook({
            _id: new mongoose.Types.ObjectId(),
            name: notebookName,
            notes: [],
            owner: accountId
        });
        return await notebook.save();
    },

    getById: async (id, populate) => {
        let notebook = await Notebook.findById(id);
        if (!populate)
            return notebook;
        return await notebook.populate("notes").execPopulate();
    },

    deleteById: async (id) => {
        let notes = await Notebook.findById(id).notes;
        for (var noteId in notes) {
            await Notes.setNotebook(noteId, undefined);
        }
        await Notebook.findByIdAndDelete(id);
    },

    getNotes: async (notebookId) => {
        let notebook = await Notebook.findById(notebookId);
        let populated = await notebook.populate({ path: "notes" }).execPopulate();
        return populated.notes;
    },

    addNote,

    removeNote,

    moveNote: async (oldNotebookId, newNotebookId, noteId) => {
        console.log({ oldNotebookId, newNotebookId, noteId });
        await removeNote(oldNotebookId, noteId);
        await addNote(newNotebookId, noteId);
    }
};

