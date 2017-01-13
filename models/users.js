var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    fb_id: {
        type: Number,
        index: true,
        required: true,
        unique: true,
    },
    email: {
        type: String,
    },
    name: {
        type: String
    },
    gender: {
        type: String
    },
    number: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
    console.log(newUser);
    newUser.save(callback);
}

module.exports.getUserByUsername = function (username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.remove = function (id, callback) {
    User.findById(id).remove(callback);
}

module.exports.getAllUsers = function (callback) {
    User.find(callback);
}

module.exports.updateUser = function (id, data, callback) {
    User.findOneAndUpdate(id, data, { returnNewDocument: true })
    callback(null, data);
}
