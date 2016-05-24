(function() {
    'use strict';
    var module = angular.module('admin');

    module.controller('UsersController', function($scope, Restangular,$log, $window,$timeout) {
        $log.debug("[UserController] init")

        var self = this;
        var nextCursor = '';
        var more = true;

        // flexible height fix for the virtual container
        // https://github.com/angular/material/issues/4314
        // might not be necessary in future angular material design versions
        // TODO create a directive
        $scope.listStyle = {
            height: ($window.innerHeight - 240) + 'px'
        };
        $window.addEventListener('resize', onResize);
        function onResize() {
            $scope.listStyle.height = ($window.innerHeight - 240) + 'px';
            $timeout($scope.$broadcast('$md-resize'),100);
            if(!$scope.$root.$$phase){
                //$scope.$digest();
            }
        }


        $scope.users = [];
        $scope.totalCount = 0;

        self.getUsers = function() {
            if (!more || $scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            Restangular.all('users').getList({cursor: nextCursor, filter: $scope.filter}).then(function(users) {
                $scope.users = $scope.users.concat(users);
                nextCursor = users.meta.nextCursor;
                more = users.meta.more;
                $scope.totalCount = users.meta.totalCount;
            }).finally(function() {
                $scope.isLoading = false;
            });
        };

        self.getUsers();

        // In this example, we set up our model using a plain object.
        // Using a class works too. All that matters is that we implement
        // getItemAtIndex and getLength.
        $scope.repeatedUsers = {
          // Required.
          getItemAtIndex: function(index) {
            var user = $scope.users[index]
            if (user !== undefined) {
              return user
            }
            if (more && !$scope.isLoading) {
                self.getUsers();
            }
            return null;
          },
          // Required.
          // For infinite scroll behavior, we always return a slightly higher
          // number than the previously loaded items.
          getLength: function() {
            return $scope.totalCount;
          }
        };



    });
}());
