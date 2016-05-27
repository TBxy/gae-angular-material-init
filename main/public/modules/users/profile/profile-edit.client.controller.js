(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ProfileEditController', 
        function($scope, gaBrowserHistory, gaToast, _, 
                gaValidators, gaTracking, gaUsers, $log,
                Upload) {

        if (!$scope.hasAuthorization()) {
            gaBrowserHistory.back();
        }

        $scope.validators = gaValidators.user;

        $scope.$watch('user', function(newVal) {
            if (newVal) {
                $scope.editedUser = $scope.user.clone();
            }
        });

        $scope.$parent.avatarChanged = false
        $scope.uploadFiles = function(files,invalidFiles){
            $scope.$parent.avatarChanged = true
            $scope.$parent.avatar = $scope.avatar
        }

        $scope.save = function() {

            if ( $scope.avatar ){
                    var upload = Upload.upload({
                        url: 'api/v1/upload/avatar/'+$scope.editedUser.key+'.jpg',
                        data: { file: $scope.avatar, 
                                link: 'private',
                                type: 'image/jpeg'}
                    });
                    upload.then(function (response) {
                        var link = response.data.private_links[0];
                        $scope.editedUser.avatar_url = link
                        gaUsers.saveAsync($scope.editedUser,true).then(function(updatedUser) {
                            _.extend($scope.user, updatedUser);
                            //_.extend($scope.user, updatedUser);
                            gaTracking.eventTrack('Profile edit', $scope.editedUser.username);
                            gaBrowserHistory.back();
                            gaToast.show('A profile was successfully updated');
                        });
                    }, function (response) {
                        if (response.status > 0) {
                            $scope.errorMsg = response.status + ': ' + response.data;
                        }
                    }, function (evt) {
                        $log.info(evt) //TODO why does this not work?
                        $scope.avatarLoaded = evt.loaded;
                        $scope.avatar.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
                } else {
                    gaUsers.saveAsync($scope.editedUser,true).then(function(updatedUser) {
                        //_.extend($scope.user, $scope.editedUser);
                        _.extend($scope.user, updatedUser);
                        gaTracking.eventTrack('Profile edit', $scope.editedUser.username);
                        gaBrowserHistory.back();
                        gaToast.show('A profile was successfully updated');
                    });
                }


        };
    });
}());
