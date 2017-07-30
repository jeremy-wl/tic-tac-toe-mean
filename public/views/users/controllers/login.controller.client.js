(function () {
    angular
        .module("ttt")
        .controller("loginController", loginController)

    function loginController($location, userService) {
        var model = this

        model.login = login

        function login(username, password) {
            if (!username || !password) {
                if      (!username)  model.error = 'Username is required.'
                else if (!password)  model.error = 'Password is required.'
                return
            }

            userService.login(username, password)
                .then(function (user) {
                    $location.url("/")
                }, function (error) {
                    model.error = "User information does not exist."
                })
        }
    }
})()
