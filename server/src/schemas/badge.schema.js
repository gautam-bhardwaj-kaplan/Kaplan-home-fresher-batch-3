const mongoose = require('mongoose');
const { Schema } = mongoose;

const badgeSchema = new Schema({
    badgeId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    iconUrl: String,
    category: {
        type: String,
        enum: ['streak', 'accuracy', 'milestone'],
        required: true
    },
    criteria: {
        type: {
            type: String,
            enum: ['streak', 'correct_answers', 'total_attempts']
        },
        threshold: Number
    },
    points: {
        type: Number,
        default: 0
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    }
}, {
    timestamps: true
});

badgeSchema.index({ badgeId: 1 }, { unique: true });
badgeSchema.index({ category: 1 });

module.exports = mongoose.model('Badge', badgeSchema);