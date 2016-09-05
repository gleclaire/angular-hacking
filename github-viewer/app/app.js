'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [ 'ui.bootstrap'])
    .controller('mainController', ['$scope', '$log', '$sce', 'GithubService',
        function ($scope, $log, $sce, GithubService) {


            $scope.searchUser = function(ghUser) {

                console.log('ghUser is ' + ghUser);


                $scope.userInfo = null;
                $scope.userRepos = {};

                if (ghUser) {
                    GithubService.getUserInfo($scope.ghUser).then(function (response) {
                        console.log('response is ' + response);
                        $scope.userInfo = response.data;

                    });

                    GithubService.getUserRepos($scope.ghUser).then(function (response) {
                        console.log('response is ' + response);
                        $scope.userRepos = response.data;

                    });

                }


            }





        }
    ])
    .service('GithubService', function ($http, $sce) {

        var baseUrl = 'https://api.github.com/users/';

        this.getUserInfo = function (username) {
            if (typeof username == 'undefined') {
                username = null;
            }
            var url = baseUrl + (username ? username : '');
            return $http.get(url, {});
        };

        this.getUserRepos = function (username) {
            if (typeof username == 'undefined') {
                username = null;
            }
            var url = baseUrl + (username ? username : '') + '/repos';
            return $http.get(url, {});
        };

    });

