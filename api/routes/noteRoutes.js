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

router.use("/:noteId", validateNoteId);

// get note by id
router.get("/:id", async (req, res, next) => {
    try {
        let note = await Notes.getById(req.params.id);
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
        await Notes.deleteById(req.params.id);
        res.status(200).json({ message: "Note deleted and removed from notebook" });
    } catch (err) {
        next(err);
    }
});

router.post("/:id/move", async (req, res, next) => {
    try {
        let noteId = req.params.id;
        let newNotebookId = req.body.newNotebookId;
        let oldNotebookId = req.params.notebookId;
        if (!(await Notebooks.exists(newNotebookId)))
            return res.sendStatus(400);

        await Notebooks.moveNote(oldNotebookId, newNotebookId, noteId);

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
