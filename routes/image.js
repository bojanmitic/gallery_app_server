const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const cloudinary = require("cloudinary");
const multer = require("multer");
const credentials = require("../config/cloudinaryCredentials");
const { validationResult } = require("express-validator/check");
const cloudinaryStorage = require("multer-storage-cloudinary");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Image = require("../models/Image");

const imageValidation = require("../validation/imageValidation");

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "images",
  allowedFormats: ["jpg", "png"],
});
const upload = multer({ storage: storage });

// Cloudinary setup
const { api_key, api_secret, cloudinary_name } = credentials;
cloudinary.config({ cloud_name: cloudinary_name, api_key, api_secret });

// @route   GET api/images
// @desc    Get all images
// @access  Public
router.get("/", (req, res) => {
  Image.find()
	.sort({ date: -1 })
	.then(images => {
	  if (images.length === 0) {
		res.status(404).json({ msg: "No images yet, please upload an image" });
	  }
	  res.json(images);
	})
	.catch(err => res.status(404).json({ msg: "No Images Found" }));
});

// @route   GET api/images/author/:id
// @desc    Get all images from one author
// @access  Public
router.get('/author/:id',(req, res) => {
	Image.find({'author': req.params.id})
	.then(images => {
		res.json(images)
	}).catch(err => res.status(404).json({msg: "No images from this author."}));
})

// @route   GET api/images/:id
// @desc    Get image by id
// @access  public
router.get("/:id", (req, res) => {
  Image.findById(req.params.id)
	.then(image => res.json(image))
	.catch(err => res.status(404).json({ msg: "Image Not found" }));
});

// @route   POST api/images
// @desc    Upload Image
// @access  private
router.post(
  "/",
  upload.single("image"),
  imageValidation,
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
	const errors = validationResult(req).formatWith(({ msg, param }) => ({
	  [param]: msg
	}));

	if (!errors.isEmpty()) {
	  return res.status(422).json({ errors: errors.array() });
	}

	const imageFields = req.body;
	imageFields.author = req.user.id;

	if (!req.file) {
	  res.status(400).json({ msg: "Image is required" });
	}

	else {
	  cloudinary.uploader.upload(req.file.path, result => {
		imageFields.imageUrl = req.file.url;
		imageFields.name = req.file.originalname;
		imageFields.cloudinaryId = req.file.public_id;

		Image.findOne({ name: imageFields.name }).then(image => {
		  if (image) {
			res.json({ msg: "Image already exists" });
		  } else {
			new Image(imageFields).save().then(image => res.json(image));
		  }
		});
	  });
	}
  }
);

// @route   DELETE api/images
// @desc    Delete Image
// @access  private
router.delete(
  "/:id",
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
	Profile.findOne({ user: req.user.id }).then(profile => {
	  Image.findById(req.params.id)
		.then(image => {
		  if (image.author.toString() !== req.user.id) {
			res.status(401).json({ msg: "User not authorized!!" });
		  }
		  cloudinary.uploader.destroy(image.cloudinaryId, (error, result) => {
			if (err) {
			  res
				.status(404)
				.json({ msg: "Somenthing went wrong, please try again" });
			}
			res.json(result);
		  });
		  image
			.remove()
			.then(() => res.json({ success: true }))
			.catch(() =>
			  res.json({ msg: "Something went wrong, please try again" })
			);
		})
		.catch(err => res.json({ msg: "Image not found" }));
	});
  }
);

// @route   POST api/images/like/:id
// @desc    Like Image
// @access  private
router.post(
  "/like/:id",
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
	Profile.findOne({ user: req.user.id })
	  .then(profile => {
		Image.findById(req.params.id).then(image => {
		  if (
			image.likes.filter(like => like.user.toString() === req.user.id)
			  .length > 0
		  ) {
			return res
			  .status(400)
			  .json({ msg: "User already liked this image" });
		  }
		  image.likes.push({ user: req.user.id });
		  image.save().then(image => res.json(image));
		});
	  })
	  .catch(() => res.status(404).json({ msg: "Image not found" }));
  }
);

// @route   POST api/images/like/:id
// @desc    Unlike Image
// @access  private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt-user", { session: false }),
  (req, res) => {
	Profile.findOne({ user: req.user.id }).then(profile => {
	  Image.findById(req.params.id).then(image => {
		if (
		  image.likes.filter(like => like.user.toString() === req.user.id)
			.length === 0
		) {
		  res.status(400).json({ msg: "You have not liked that image" });
		}

		const userIndex = image.likes
		  .map(item => item.user.toString())
		  .indexOf(req.user.id);

		  image.likes.splice(userIndex, 1);

		  image.save().then(image => res.json(image))
	  });
	}).catch(() => res.status(404).json({msg: "Image not found"}));
  }
);

module.exports = router;
