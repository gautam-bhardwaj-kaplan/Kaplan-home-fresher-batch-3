const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    submittedAnswer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    attemptDate: {
        type: Date,
        required: true
    }
});

submissionSchema.index({ userId: 1, attemptDate: 1 }, { unique: true });
submissionSchema.index({ questionId: 1 });
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ attemptDate: 1 });

module.exports = mongoose.model('Submission', submissionSchema);