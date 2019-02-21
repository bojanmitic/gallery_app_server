const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../config/keys");


const { validationResult } = require("express-validator/check");
const registerValidation = require("../validation/registerValidation");
const loginValidation = require("../validation/loginValidation");

const User = require("../models/User");

// @route   POST api/users/register
// @desc    Register in application
// @access  Public
router.post("/register", registerValidation, (req, res, next) => {
  const errors = validationResult(req).formatWith(({ msg, param }) => ({
    [param]: msg
  }));

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exists.";
        return res.status(422).json(errors);
      }
    })
    .catch(err => console.log(err));

  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser
        .save()
        .then(user => res.json(user))
        .catch(() => "User can't be saved to DB, due to internal error");
    });
  });
});

// @route   POST api/users/login
// @desc    Login in application
// @access  Private
router.post("/login", loginValidation, (req, res) => {
  const errors = validationResult(req).formatWith(({ msg, param }) => ({
    [param]: msg
  }));
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.json({ err: "User doesn't exists" });
      }else{
        bcrypt.compare(password, user.password).then(isMatch => {
          if (isMatch) {
            const { id, firstName, lastName, email } = user;
            const payload = { id: user._id, firstName: user.firstName };
            const token = jwt.sign(payload,keys.secretOrKey, {expiresIn: "6h"});
      
            res.cookie("jwt_token", token, {httpOnly: true});
            return res.json({
              id,
              firstName,
              lastName,
              email
            });
          } else {
            errors.password = "Incorrect password.";
            return res.status(400).json(errors);
          }
        }).catch(err => res.status(422).json(err));
      }
    }).catch(err => res.status(422).json(err));
});


// @route   get api/users/logout
// @desc    Logout user
// @access  Private
router.get("/logout", (req, res) => {
	res.clearCookie("jwt_token");
	res.send("cleared cookie");
});

// @route   get api/users/current
// @desc    Get personal data
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
    });
  }
);

module.exports = router;
