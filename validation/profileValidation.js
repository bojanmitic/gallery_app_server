const { check, validationResult } = require("express-validator/check");

const profileValidation = [
  check("personalSitePortfolio")
    .isURL()
    .withMessage("Personal site link is invalid"),
  check("location")
    .isLength({ min: 5, max: 120 })
    .withMessage("Location must be between 5 and 120 characters"),
  check("bio")
    .isLength({max: 300})
    .withMessage("Bio must be less than 300 "),

];

module.exports = profileValidation;
