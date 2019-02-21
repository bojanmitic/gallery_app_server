const { check, validationResult } = require("express-validator/check"); 

const loginValidation = 
[
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
];

module.exports = loginValidation;