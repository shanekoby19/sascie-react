const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startDate: Date,
    endDate: Date,
    executions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Execution'
        }
    ]
});

itemSchema.pre(/^find/, function(next) {
    this.populate('executions');

    next();
});

const itemModel = mongoose.model('Item', itemSchema);

module.exports = itemModel;