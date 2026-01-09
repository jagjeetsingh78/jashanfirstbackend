const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    age: Number,
    password: String,
    email: String,
    name: String,
});

module.exports = mongoose.model('user', userSchema);