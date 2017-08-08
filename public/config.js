(function () {
    angular
        .module("ttt")
        .config(configuration)

    function configuration($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home/templates/home.view.client.html',
                controller: 'homeController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
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
            .when('/local', {
                templateUrl: 'views/games/templates/game-local.view.client.html',
                controller: 'gameLocalController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
            .when('/online', {
                templateUrl: 'views/games/templates/game-online.view.client.html',
                controller: 'gameOnlineController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
            .when('/games', {
                templateUrl: 'views/games/templates/games-index.view.client.html',
                controller: 'gamesListController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
            .when('/users/:userId/games', {
                templateUrl: 'views/games/templates/games-index.view.client.html',
                controller: 'gamesListController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
            .when('/games/:gameId', {
                templateUrl: 'views/games/templates/games-show.view.client.html',
                controller: 'gamesShowController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
            .when('/users/', {
                templateUrl: 'views/admin/templates/admin-users.view.client.html',
                controller: 'adminUsersController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkAdmin
                }
            })

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

        function checkAdmin(userService, $q, $location) {
            var deferred = $q.defer()

            userService
                .checkAdmin()
                .then(function (user) {
                    if (user == '0') {
                        deferred.reject()
                        $location.url('/')
                    } else {
                        deferred.resolve()
                    }
                })

            return deferred.promise
        }
    }
})()
