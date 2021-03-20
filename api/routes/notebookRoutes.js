const express = require("express");
const router = express.Router();
const noteRoutes = require("./noteRoutes");
const Accounts = require("../database/accounts");
const Notebooks = require("../database/notebooks");
const Notes = require("../database/notes");

// create notebook and add to account
router.post("/", async (req, res, next) => {
    try {
        let notebook = await Notebooks.create(req.body.name, req.accountId);
        await Accounts.addNotebook(req.accountId, notebook._id);
        res.status(201).json({ message: "Notebook created and added to account", notebook });
    } catch (err) {
        next(err);
    }
});

// get all notebooks
router.get("/", async (req, res, next) => {
    try {
        let notebooks = await Accounts.getNotebooks(req.accountId);
        res.status(200).json({ notebooks });
    } catch (err) {
        next(err);
    }
});

// validate notebook ids for routes after
router.use("/:notebookId", validateNotebookId);

// get notebooks by name
// requires indexing

router.get("/:id", async (req, res, next) => {
    try {
        let notebook = await Notebooks.getById(req.params.id, req.body.populate);
        res.status(200).json({ notebook });
    } catch (err) {
        next(err);
    }
});

// delete notebook by id and remove from account
router.delete("/:id", async (req, res, next) => {
    try {
        await Accounts.removeNotebook(req.accountId, req.params.id);
        await Notebooks.deleteById(req.params.id);
        res.status(200).json({ message: "Notebook deleted and removed from account" });
    } catch (err) {
        next(err);
    }
});

// notes middleware
router.use("/:notebookId/notes", noteRoutes);

async function validateNotebookId(req, res, next) {
    const accountId = req.accountId;
    const notebookId = req.params.notebookId;
    if (!(await Notebooks.exists(notebookId))) return res.status(404).json({ message: "Notebook does not exist" });
    if (accountId != (await Notebooks.getById(notebookId)).owner) return res.sendStatus(403);
    req.notebookId = notebookId;
    next();
}

module.exports = router;