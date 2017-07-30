var mongoose = require('mongoose')
var userSchema = require('./user.schema.server')
var userModel = mongoose.model('user', userSchema)

userModel.createUser = createUser
userModel.findUserById = findUserById
userModel.findAllUsers = findAllUsers
userModel.findUserByUsername = findUserByUsername
userModel.findUserByGoogleId = findUserByGoogleId
userModel.findUserByFacebookId = findUserByFacebookId
userModel.updateUser = updateUser
userModel.deleteUser = deleteUser

module.exports = userModel

function createUser(user) {
    if (!user.roles || user.roles.length === 0) {
        user.roles = ['PLAYER']
    }
    return userModel.create(user)
}

function findUserById(userId) {
    return userModel.findById(userId)
}

function findAllUsers() {
    return userModel.find()
}

function findUserByUsername(username) {
    return userModel.findOne({
        username: username
    })
}

function findUserByGoogleId(googleId) {
    return userModel.findOne({
        'google.id': googleId
    })
}

function findUserByFacebookId(facebookId) {
    return userModel.findOne({
        'facebook.id': facebookId
    })
}

function updateUser(userId, newUser) {
    return userModel.update(
        { _id: userId },
        { $set: newUser },
        { runValidators: true }  // Mongoose does not validate data on update by default
    )
}

function deleteUser(userId) {
    return userModel.remove({ _id: userId })
}
