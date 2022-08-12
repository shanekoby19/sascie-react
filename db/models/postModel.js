const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'A post must have a comment.']
    },
    photo: {
        type: String,
        required: [true, 'A post must have a user photo assigned to it.']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    lastUpdatedAt: {
        type: Date,
        required: [true, 'A post must have the date and time for which it was last updated.']
    },
    files: {
        type: [String],
    },
    createdBy: {
        type: String,
        required: [true, 'A post must have a reference to who last updated it.']
    }
});

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;