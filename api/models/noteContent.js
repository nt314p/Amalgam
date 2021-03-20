const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteContentSchema = Schema({
    _id: Schema.Types.ObjectId,
    content: String,
    note: { type: Schema.Types.ObjectId, ref: 'Note' },
    owner: { type: Schema.Types.ObjectId, ref: 'Account' }
});

module.exports = mongoose.model('NoteContent', noteContentSchema);