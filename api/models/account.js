const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    name: String,
    hashedPassword: String,
    notebooks: [{ type: Schema.Types.ObjectId, ref: 'Notebook', default: [] }],
});

module.exports = mongoose.model('Account', accountSchema);