const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',  
        required: true,
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    }]
}, {
    timestamps: true,
});

module.exports = mongoose.model('Post', PostSchema);