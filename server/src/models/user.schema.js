const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['learner', 'admin'],
        default: 'learner'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    providerId: String,
    profilePicture: String,

    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastAttemptDate: Date,
    totalQuestionsAttempted: {
        type: Number,
        default: 0
    },
    totalCorrectAnswers: {
        type: Number,
        default: 0
    },

    badges: [{
        badgeId: String,
        earnedAt: Date
    }],
    totalPoints: {
        type: Number,
        default: 0
    },

    emailNotifications: {
        type: Boolean,
        default: true
    },
    notificationTime: {
        type: String,
        default: "09:00"
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ currentStreak: -1 });
userSchema.index({ totalPoints: -1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);