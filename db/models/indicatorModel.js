const mongoose = require('mongoose');

const indicatorSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'An indicator must have a name.']
    },
    status: {
        type: String,
        enum: {
            values: ["Incomplete", "Under Review", "Completed"],
            message: 'The indicator status must be "Incomplete", "Under Review", or "Completed"',
        },
        default: "Incomplete"
    },
    posts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }]
});

// Populate query middleware
indicatorSchema.pre(/^find/, function(next) {
    this.populate('posts');

    next();
})

const indicatorModel = mongoose.model('Indicator', indicatorSchema);

module.exports = indicatorModel;