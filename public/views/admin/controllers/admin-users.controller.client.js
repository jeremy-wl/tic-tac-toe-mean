(function () {
    angular
        .module('ttt')
        .controller('adminUsersController', adminUsersController)

    function adminUsersController(userService, $location) {
        var model = this
        model.logout = logout
        model.selectUser = selectUser
        model.upsertUser = upsertUser
        model.deleteUser = deleteUser
        model.findAllUsers = findAllUsers
        init()

        function init() {
            model.user = {}
            userService
                .findAllUsers()
                .then(function (users) {
                    model.users = users
                })
        }

        function logout() {
            userService
                .logout()
                .then(function () {
                    $location.url('/')
                })
        }

        function findAllUsers() {
            userService
                .findAllUsers()
                .then(function (users) {
                    model.users = users
                })
        }

        function deleteUser(user) {
            if (confirm('Are you sure to delete user ' + user.username + ' ?')) {
                userService
                    .deleteUser(user._id)
                    .then(function () {  // removing that user from view model
                        var deletedUser = model.users.find(function (u) {
                            return user._id === u._id
                        })
                        var index = model.users.indexOf(deletedUser)
                        model.users.splice(index, 1)
                    })
            }
        }

        function selectUser(userId) {
            var selectedUser = model.users.find(function (user) {
                return user._id === userId
            })
            model.user = angular.copy(selectedUser)
        }

        function upsertUser(user) {
            if (!user.roles) {
                user.roles = ['PLAYER']
            } else if (typeof user.roles === 'string') {
                var rolesArr = []
                user.roles.split(',')
                    .map(function (t) {
                        rolesArr.push(t.trim().toUpperCase())
                    })
                user.roles = rolesArr
            }
            return userService
                .upsertUser(user)
                .then(function (user) {
                    findAllUsers()   // re-fetch updated users list from server
                })
                .then(function () {
                    model.user = {}
                })
                .catch(function (obj) {         // unwrapping error messages, could be
                    var data = obj.data || obj  // - duplicate username
                    var messages = ""           // - invalid user role(s)
                    for (var i in data) {
                        var message = data[i].message || data[i]
                        if (!message || typeof message !== 'string')  continue
                        messages += message + '\n'
                    }
                    alert(messages)
                })
        }
    }

})()
