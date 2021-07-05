// Some code from: 
// https://github.com/academind/node-restful-api-tutorial
// https://github.com/KrunalLathiya/MEVNCRUDExample

require('dotenv').config();
const accountRoutes = require("./routes/accountRoutes");
const express = require('express');
const expressValidator = require('express-validator');
const Accounts = require('./database/accounts');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.sendStatus(200);
    }
    next();
});

app.post("/checkUniqueUsername", checkUniqueUsername);

app.use("/accounts", accountRoutes);
1
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    if (process.env.NODE_ENV == "development") console.log(error);
    if (process.env.NODE_ENV != "production") {
        res.json({
            error
        });
    } else {
        res.sendStatus(500);
    }
});

async function checkUniqueUsername(req, res) {
    res.status(200).json({ result: await Accounts.isUniqueUsername(req.body.username) });
}

module.exports = app;