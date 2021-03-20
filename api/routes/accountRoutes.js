const express = require("express");
const router = express.Router();
const notebookRoutes = require("./notebookRoutes");
const { body, validationResult } = require('express-validator');
const Accounts = require("../database/accounts");
const Notebooks = require("../database/notebooks");
const Validations = require("./validations");
const jwt = require('jsonwebtoken');
const jwt_key = process.env.JWT_KEY;

// Create new account
router.post("/",
    Validations.username,
    Validations.name,
    Validations.password,
    Validations.isEmpty("hello?"),
    checkValidation,
    async (req, res) => {
        try {
            if (!(await Accounts.isUniqueUsername())) {
                return res.status(422).json({ message: "Username already taken" });
            }
            let createdAccount = await Accounts.create(req.body);
            res.status(201).json({
                message: "Account created",
                createdAccount: createdAccount
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post("/login", async (req, res) => {
    if (await Accounts.isUniqueUsername(req.body.username)) {
        return res.status(401).json({ message: "Username or password is incorrect" });
    }

    const result = await Accounts.login(req.body.username, req.body.password);
    if (result) {
        const account = await Accounts.getByUsername(req.body.username);
        jwt.sign({ account }, jwt_key, (err, token) => res.status(200).json({ token: token, id: account._id }));
    } else {
        return res.status(401).json({ message: "Username or password is incorrect" });
    }
});

router.use(verifyToken);

// validate account id for routes beyond this point
router.use("/:accountId", validateAccountId);

router.get("/:id", async (req, res, next) => {
    try {
        let account = await Accounts.getById(req.params.id);
        account.hashedPassword = undefined;
        res.status(200).json({ account });
    } catch (err) {
        next(err);
    }
});

// notebook middleware
router.use("/:accountId/notebooks", notebookRoutes);

async function validateAccountId(req, res, next) {
    const accountId = req.params.accountId;
    if (!(await Accounts.exists(accountId))) return res.status(404).json({ message: "Account does not exist" });
    if (accountId != req.accountId) return res.sendStatus(403);
    next();
}

async function checkValidation(req, res, next) {
    const errorsResult = validationResult(req);
    if (!errorsResult.isEmpty()) {
        let errors = {};
        errors.validationErrors = errorsResult.array({ onlyFirstError: true });
        errors.status = 422;
        return next(errors);
    }
}

function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization; //get auth header value

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1]; // "Bearer [token]"
        jwt.verify(bearerToken, jwt_key, (err, authData) => {
            if (!err) {
                req.authData = authData;
                req.accountId = authData.account._id;
                next();
            } else {
                res.status(401).json({message: "Invalid or expired token"});
            }
        });
    } else {
        res.status(400).json({message: "Missing authentication token"});
    }
}

module.exports = router;