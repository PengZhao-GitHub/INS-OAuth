const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    thirdpartyid: String,
    thumbnail: String,
    email: String,
    password: String,
    date: Date
});

const User = mongoose.model('myuser', userSchema);

module.exports = User;


