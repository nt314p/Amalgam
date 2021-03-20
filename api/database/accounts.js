const mongoose = require("mongoose");
const Account = require("../models/account");
const bcrypt = require('bcrypt');
const saltRounds = 12;

module.exports = {
    exists: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return false;
        return await Account.exists({ _id: id });
    },

    create: async (accountData) => {
        let hash = await bcrypt.hash(accountData.password, saltRounds);
        let account = new Account({
            _id: new mongoose.Types.ObjectId(),
            username: accountData.username,
            name: accountData.name,
            hashedPassword: hash
        });

        return await account.save();
    },

    getByUsername: async (username) => await Account.findOne({ "username": username }),

    login: async (username, password) => {
        let account = await Account.findOne({ "username": username });
        return await bcrypt.compare(password, account.hashedPassword);
    },

    getById: async (id) => {
        let account = await Account.findById(id);
        account.hashedPassword = undefined;
        return account;
    },

    getNotebooks: async (id) => {
        let account = await Account.findById(id);
        let populated = await account.populate({ path: "notebooks" }).execPopulate();
        return populated.notebooks;
    },

    addNotebook: async (id, notebookId) => {
        let account = await Account.findById(id);
        account.notebooks.push(notebookId);
        await account.save();
    },

    removeNotebook: async (id, notebookId) => {
        let account = await Account.findById(id);
        account.notebooks.push(notebookId);
        await account.save();
    },

    isUniqueUsername: async (username) => (await Account.countDocuments({ "username": username })) == 0
};