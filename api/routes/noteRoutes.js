const express = require("express");
const router = express.Router();
const Notebooks = require("../database/notebooks");
const Notes = require("../database/notes");

// create note and add it to notebook
router.post("/", async (req, res, next) => {
    try {
        let noteData = req.body;
        noteData.accountId = req.accountId;
        noteData.notebookId = req.notebookId;

        let note = await Notes.create(noteData);
        await Notebooks.addNote(req.notebookId, note._id);
        res.status(201).json({
            message: "Note created and added to notebook", note
        });
    } catch (err) {
        next(err);
    }
});

// get all notes
router.get("/", async (req, res, next) => {
    try {
        let notes = await Notebooks.getNotes(req.notebookId);
        res.status(200).json({ notes });
    } catch (err) {
        next(err);
    }
});

router.use("/:noteId", validateNoteId);

// get note by id
router.get("/:id", async (req, res, next) => {
    try {
        let note = await Notes.getById(req.params.id, req.body.populate);
        res.status(200).json({ note });
    } catch (err) {
        next(err);
    }
});

// edit note
router.put("/:id", async (req, res, next) => {
    try {
        let newNote = req.body;
        let note = await Notes.updateById(req.params.id, newNote);
        res.status(200).json({ message: "Note updated", note });
    } catch (err) {
        next(err);
    }
});

// delete note
router.delete("/:id", async (req, res, next) => {
    try {
        await Notebooks.removeNote(req.notebookId, req.params.id);
        await Notes.deleteById(req.params.id);

        res.status(200).json({ message: "Note deleted and removed from notebook" });
    } catch (err) {
        next(err);
    }
});

router.post("/:id/move", async (req, res, next) => {
    try {
        let noteId = req.params.id;
        let targetNotebookId = req.body.targetNotebookId;
        let currentNotebookId = req.notebookId;
        if (targetNotebookId === currentNotebookId)
            return res.status(400).json({ message: "Target notebook cannot be current notebook" });
        let targetNotebookExists = await Notebooks.exists(targetNotebookId);
        if (!targetNotebookExists)
            return res.status(404).json({ message: "Target notebook does not exist" });

        let targetNotebook = await Notebooks.getById(targetNotebookId);

        if (targetNotebook.owner != req.accountId){
            return res.status(403).json({ message: "Target notebook is not owned" });
        }
        
        await Notebooks.moveNote(currentNotebookId, targetNotebookId, noteId);

        res.status(200).json({ message: "Note moved" });
    } catch (err) {
        next(err);
    }
});

async function validateNoteId(req, res, next) {
    const accountId = req.accountId;
    const noteId = req.params.noteId;
    if (!await Notes.exists(noteId)) return res.status(404).json({ message: "Note does not exist" });
    if (accountId != (await Notes.getById(noteId)).owner) return res.sendStatus(403);
    req.noteId = noteId;
    next();
}

module.exports = router;
