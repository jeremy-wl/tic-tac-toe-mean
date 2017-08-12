(function () {
    angular
        .module('ttt')
        .controller('homeController', homeController)

    function homeController(userService, currentUser) {
        var model = this
        model.isAdmin = isAdmin
        model.logout = logout

        init()

        function init() {
            if (currentUser) {
                model.user = currentUser
            }
        }

        function logout() {
            userService.logout()
            delete model.user
        }

        function isAdmin(user) {
            return user && user.roles.indexOf('ADMIN') >= 0
        }
    }
})()
