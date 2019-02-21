const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	imageUrl:{
	  type: String,
	  required: true
	},
	name: {
	  type: String,
	  required: true
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'users',
		index: true
	},
	cloudinaryId: {
	  type: String,
	  required: true
	},
	likes: [
		{
		  user: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		  }
		}
	  ],
	  comments: [
		{
		  user: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		  },
		  text: {
			type: String,
			required: true
		  },
		  userName: {
			type: String
		  },
		  avatar: {
			type: String
		  },
		  date: {
			type: Date,
			default: Date.now
		  }
		}
	  ],
	  cameraMake: {
		  type: String,
		  required: true
	  },
	  cameraModel: {
		  type: String,
		  required: true
	  },
	  focalLength: {
		  type: String,
		  required: true
	  },
	  iso: {
		  type: String,
		  required: true
	  },
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = User = mongoose.model('image', ImageSchema);