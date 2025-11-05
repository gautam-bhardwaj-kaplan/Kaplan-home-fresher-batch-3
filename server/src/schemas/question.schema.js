const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    scheduledDate: {
        type: Date,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['Math', 'English', 'Coding', 'Science', 'General'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['mcq', 'short_answer'],
        default: 'mcq'
    },
    options: [String],
    correctAnswer: {
        type: String,
        required: true
    },
    acceptedAnswers: [String],
    caseSensitive: {
        type: Boolean,
        default: false
    },
    explanation: String,
    points: {
        type: Number,
        default: 10
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    correctAttempts: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

questionSchema.index({ scheduledDate: 1 }, { unique: true });
questionSchema.index({ category: 1, scheduledDate: 1 });
questionSchema.index({ isActive: 1, scheduledDate: 1 });

module.exports = mongoose.model('Question', questionSchema);