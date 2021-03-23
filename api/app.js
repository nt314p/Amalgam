// Some code from: 
// https://github.com/academind/node-restful-api-tutorial
// https://github.com/KrunalLathiya/MEVNCRUDExample

require('dotenv').config();
const accountRoutes = require("./routes/accountRoutes");
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const Accounts = require('./database/accounts');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    console.log(error);
    res.json({
        error // don't send error back in production
    });
});

async function checkUniqueUsername(req, res) {
    res.status(200).json({ result: await Accounts.isUniqueUsername(req.body.username) });
}

module.exports = app;