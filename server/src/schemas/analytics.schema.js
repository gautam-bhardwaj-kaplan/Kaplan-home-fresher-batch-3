const mongoose = require('mongoose');
const { Schema } = mongoose;

const analyticsSchema = new Schema({
    date: {
        type: Date,
        unique: true,
        required: true
    },
    totalUsers: {
        type: Number,
        default: 0
    },
    activeUsers: {
        type: Number,
        default: 0
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    correctAttempts: {
        type: Number,
        default: 0
    },
    averageAccuracy: {
        type: Number,
        default: 0
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question'
    },
    categoryBreakdown: [{
        category: String,
        attempts: Number,
        correctCount: Number
    }]
}, {
    timestamps: true
});

analyticsSchema.index({ date: -1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);