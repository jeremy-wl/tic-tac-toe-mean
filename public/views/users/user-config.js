(function () {
    angular
        .module("ttt")
        .config(configuration)

    function configuration($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'views/users/templates/login.view.client.html',
                controller: 'loginController',
                controllerAs: 'model'
            })
            .when('/register', {
                templateUrl: 'views/users/templates/register.view.client.html',
                controller: 'registerController',
                controllerAs: 'model'
            })
            .when('/profile', {
                templateUrl: 'views/users/templates/profile.view.client.html',
                controller: 'profileController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
    }

    function checkLoggedIn(userService, $q, $location) {
        var deferred = $q.defer()

        userService
            .checkLoggedIn()
            .then(function (user) {
                if (user == '0') {
                    deferred.reject()
                    $location.url('/login')
                } else {
                    deferred.resolve(user)
                }
            })

        return deferred.promise
    }
})()
