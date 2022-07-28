const mongoose = require('mongoose');

const serviceAreaSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    items: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Item',
        }
    ]
});

// QUERY MIDDLEWARE

// Populate items field with database item objects.
serviceAreaSchema.pre(/^find/, function(next) {
    this.populate('items');

    next();
})

const serviceAreaModel = mongoose.model('ServiceArea', serviceAreaSchema);

module.exports = serviceAreaModel;