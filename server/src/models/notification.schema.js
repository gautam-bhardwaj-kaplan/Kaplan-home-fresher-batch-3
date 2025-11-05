const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['daily_reminder', 'streak_alert', 'badge_earned'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    scheduledFor: {
        type: Date,
        required: true
    },
    sentAt: Date,
    subject: String,
    body: String,
    metadata: Schema.Types.Mixed,
    attempts: {
        type: Number,
        default: 0
    },
    lastError: String
}, {
    timestamps: true
});

notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);