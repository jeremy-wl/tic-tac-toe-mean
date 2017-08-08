(function () {
    angular
        .module('ttt')
        .controller('adminUsersController', adminUsersController)

    function adminUsersController(userService, $location) {
        var model = this
        model.logout = logout
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

        function deleteUser(userId) {
            userService
                .deleteUser(userId)
                .then(function () {  // removing that user from view model
                    var deletedUser = model.users.find(function (user) {
                        return userId === user._id
                    })
                    var index = model.users.indexOf(deletedUser)
                    model.users.splice(index, 1)
                })
        }
    }

})()
