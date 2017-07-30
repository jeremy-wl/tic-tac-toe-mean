(function () {
    angular
        .module("ttt")
        .controller("registerController", registerController)

    function registerController($location, userService) {
        var model = this
        model.registerUser = registerUser

        function registerUser(username, password, passwordConfirm) {

            if (model.error = userService.validateCredentials(username, password, passwordConfirm)) {
                return
            }

            userService
                .findUserByUserName(username)
                .then(function () {
                    var newUser = {
                        username: username,
                        password: password
                    }
                    return userService.registerUser(newUser)

                })
                .then(function () {
                    $location.url('/profile')
                })
                .catch(function (obj) {
                    model.error = obj.error
                })

        }

    }
})()
