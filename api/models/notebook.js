const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notebookSchema = Schema({
    _id: mongoose.Types.ObjectId,
    name: String,
    notes: [{ type: Schema.Types.ObjectId, ref: 'Note', default: [] }],
    owner: { type: Schema.Types.ObjectId, ref: 'Account' }
});

module.exports = mongoose.model('Notebook', notebookSchema);
