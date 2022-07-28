const mongoose = require('mongoose');

const programSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A program must have a name.'],
        maxLength: [100, 'A programs name cannot be more than 100 characters.'],
        unique: true,
    },
    serviceAreas: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'ServiceArea'
        }
    ]
});


// QUERY MIDDLEWARE

// Populate service areas into the programs collection.
programSchema.pre(/^find/, function(next) {
    this.populate('serviceAreas');

    next();
})


const programModel = mongoose.model('Program', programSchema);

module.exports = programModel;