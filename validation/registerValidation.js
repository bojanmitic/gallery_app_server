const { check, validationResult } = require("express-validator/check"); 

const registerValidation = 
[
    check("firstName")
      .exists({ checkFalsy: true })
      .withMessage("First name is required")
      .isLength({ min: 2, max: 20 })
      .withMessage("First name must be between 2 and 20 characters")
      .not()
      .matches("[0-9]")
      .withMessage("First name cannot contain number"),
    check("lastName")
      .not()
      .isEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 20 })
      .withMessage("Last name must be between 2 and 20 characters")
      .not()
      .matches("[0-9]")
      .withMessage("Last name cannot contain number"),
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    check("password")
      .exists({ checkFalsy: true })
      .withMessage("Password is required")
      .matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
      .withMessage(
        "Password must be at least 8 characters in length, in which contain at least 1 number, 1 capitalized character and 1 symbol"
      )
  ]

  module.exports = registerValidation;