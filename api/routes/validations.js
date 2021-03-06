const { body, param, validationResult } = require('express-validator');

function checkValidation(req, res, next) {
    const errorsResult = validationResult(req);
    if (!errorsResult.isEmpty()) {
        let errors = {};
        errors.validationErrors = errorsResult.array({ onlyFirstError: true });
        errors.status = 422;
        return next(errors);
    }
    next();
}
/*
module.exports = {
    username:
        body("username").exists().withMessage("Username property cannot be empty")
            .isString()
            .custom(value => !/\s/.test(value)).withMessage("Username cannot include spaces"),

    name: body("name").exists().withMessage("Name property cannot be empty")
        .isAlpha().withMessage("Name contains invalid numbers or symbols"),

    password: body("password").exists().withMessage("Password property cannot be empty")
        .isString()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/).withMessage("Password must contain at least one capital letter")
        .matches(/[1-9]/).withMessage("Password must contain at least one number")
        .matches(/[$-/:-?{-~!"^_`\[\]]/).withMessage("Password must contain at least one symbol"),

    isEmpty: function (value) {
        return (req, res, next) => {
            console.log(value + " im inside hi");
            console.log(req.body);
            next();
        }
    }
};*/

module.exports.createAccount = [
    body("username").exists().withMessage("Username property cannot be empty")
        .isString()
        .custom(value => !/\s/.test(value)).withMessage("Username cannot contain spaces"),

    body("name").exists().withMessage("Name property cannot be empty"),

    body("password").exists().withMessage("Password property cannot be empty")
        .isString()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[1-9]/).withMessage("Password must contain at least one number")
        .matches(/[$-/:-?{-~!"^_`\[\]]/).withMessage("Password must contain at least one symbol"),

    checkValidation
];

