const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
    metric: {
        type: String,
        enum: {
            values: ['Compliance', 'Needs Improvement', 'Beginning', 'Emerging',
                     'Implementing', 'Refining', 'Mastering'],
            message: 'Invalid metric: The execution metric must be: Compliance, Needs Improvement, Beginning, Emerging, Implementing, Refining or Mastering',
        },
        default: 'Needs Improvement',
    },
    status: {
        type: String,
        enum: {
            values: ['Not Started', 'Under Review', 'Completed'],
            message: 'Invalid status: The execution status must be: Not Started, Under Review or Completed',
        },
        default: 'Not Started',
    },
    indicators: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Indicator'
    }],
    lastUpdatedBy: {
        type: String,
        required: [true, 'Please provide the name of the person who last updated this indicators']
    },
    lastUpdatedAt: {
        type: Date,
        required: [true, 'Please provide the date at which the indicator was last updated.']
    },
    required: {
        type: Boolean,
        default: true,
    }
});

// QUERY MIDDELWARE

// Populate a post when a indicator is fetched from the database.
executionSchema.pre(/^find/, function(next) {
    this.populate('indicators');
    
    next();
});

const executionModel = mongoose.model('Execution', executionSchema);

module.exports = executionModel;