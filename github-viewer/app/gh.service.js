'use strict';

angular.module('myApp')
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
