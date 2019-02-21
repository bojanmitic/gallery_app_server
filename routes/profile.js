const express = require("express");
const router = express.Router();
const passport = require("passport");
const keys = require("../config/keys");
const cloudinary = require("cloudinary");
const multer = require("multer");
const credentials = require("../config/cloudinaryCredentials");
const cloudinaryStorage = require("multer-storage-cloudinary");

const { validationResult, check } = require("express-validator/check");
const profileValidation = require("../validation/profileValidation");

const User = require("../models/User");
const Profile = require("../models/Profile");

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "avatars",
  allowedFormats: ["jpg", "png"]
});
const upload = multer({ storage: storage });

// Cloudinary setup
const { api_key, api_secret, cloudinary_name } = credentials;
cloudinary.config({ cloud_name: cloudinary_name, api_key, api_secret });

// @route   GET api/profiles/current
// @desc    Get current user profile
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .populate("user", "email lastName firstName")
      .then(profile => {
        if (!profile) {
          return res
            .status(404)
            .json({ msg: "There is no profile for this user" });
        }
        res.json(profile);
      })
      .catch(err => err => res.status(404).json(err));
  }
);

// @route   POST api/profiles/current
// @desc    Login in application
// @access  Private
router.post(
  "/current",
  upload.single("avatar"),
  profileValidation,
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
    const errors = validationResult(req).formatWith(({ msg, param }) => ({
      [param]: msg
    }));

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.personalSitePortfolio)
      profileFields.personalSitePortfolio = req.body.personalSitePortfolio;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.avatar) profileFields.avatar = req.body.avatar;
    if (req.body.interests !== undefined) {
      profileFields.interests = req.body.interests.split(",");
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      //if Profile exists update it
      if (profile) {
        const updateProfile = data => {
          Profile.findOneAndUpdate({ user: req.user.id }, data, { new: true })
            .populate("user", "email lastName firstName")
            .then(profile => res.json(profile))
            .catch(err =>
              res.status(404).json({
                msg:
                  "Profile can't be updated due to internal error, please try again"
              })
            );
        };
        if (req.file) {
          cloudinary.uploader.upload(req.file.path, result => {
            profileFields.avatarCloudinaryUrl = req.file.url;
            profileFields.avatarCloudinaryId = req.file.public_id;
            updateProfile(profileFields);
          });
        } else {
          updateProfile(profileFields);
        }
      }
      // If no Profile - create it
      else {
        new Profile(profileFields).save().then(profile => res.json(profile));
      }
    });
  }
);

// @route   DELETE api/profiles/current
// @desc    Remove profile and user
// @access  Private
router.delete(
  "/current",
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);
// router.put(
//   "/current",
//   upload.single("avatar"),
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     let editedProfile = req.body;
//     const updateProfile = data => {
//       User.findByIdAndUpdate(req.user.id, req.body, { new: true, upsert: true })
//         .then(personalInfo => {
//           res.json(personalInfo);
//         })
//         .catch(() => res.json({ msg: "User not found, and can't be updated" }));
//     };

//     if (req.file) {
//       cloudinary.uploader.upload(req.file.path, result => {
//         editedProfile.avatar = result.secure_url;
//         updateProfile(editedProfile);
//       });
//     } else {
//       updateProfile(editedProfile);
//     }
//   }
// );

router.get("/:id", (req, res) => {
  Profile.findOne({ user: req.params.id })
    .populate("user", "firstName lastName email")
    .then(profile => {});
});

module.exports = router;
