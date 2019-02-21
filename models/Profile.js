const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    personalSitePortfolio: {
        type: String
    },
    location: {
        type: String
    },
    bio: {
        type: String
    },
    avatarCloudinaryUrl: {
        type: String
    },
    avatarCloudinaryId: {
        type: String
    },
    interests: {
        type: [String]
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('profile', ProfileSchema);