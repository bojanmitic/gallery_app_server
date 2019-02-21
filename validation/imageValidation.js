const { check, validationResult } = require("express-validator/check");

const imageValidation = [
    check("cameraMake")
    .exists({ checkFalsy: true })
    .withMessage("Camera make is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Camera make must be between 2 and 20 characters"),
   check("cameraModel")
    .exists({ checkFalsy: true })
    .withMessage("Camera model is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Camera model must be between 2 and 20 characters"),
   check("focalLength")
    .exists({ checkFalsy: true })
    .withMessage("Focal length is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Focal length must be between 2 and 20 characters"),
   check("iso")
    .exists({ checkFalsy: true })
    .withMessage("Iso is required")
];

module.exports = imageValidation;
