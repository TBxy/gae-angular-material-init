(function() {
    'use strict';
    var module = angular.module('users');

    /**
     * @name wdTags
     * @memberOf angularModule.core
     * @description
     * Loads and updates tags
     */

    module.service('gaUsers', 
        function(Restangular,$log, $q,$timeout) {
        $log.debug("[gaUsers] init ");
        var self = this;

        /*****************************************************************
         * loading is true if something is loading
         */
        this.loading = false;

        /*****************************************************************
         * Variables used in loadMoreUsers
         */
        this.users = {} ;
        this.more = true;
        this.isLoading = false;
        var totalUsers = 0;
        var nextCursor = '';
        /*****************************************************************
         * Load async 'users' from the server.
         * If a user is already available offline it is updated with the 
         * server version.
         *
         * Parameters:
         *
         * Returns:
         * - users    : an array with the new loaded users
         */
        this.loadMoreUsers = function() {
            $log.debug("[gaUsers:loadMoreUsers] start ")
            var deferred = $q.defer();
            if (!self.more || self.isLoading) {
                $log.warn("[gaUsers:loadMoreUsers] no more users or loading (more: "+self.more+",loading: "+self.isLoading)
                deferred.reject("No more tags are already loading");
            }
            self.isLoading = true;
            var newUsers;
            var userByKey;
            Restangular.all('users').getList({cursor: nextCursor})
                .then(function(users) {
                    newUsers = users
                    userByKey = _.keyBy(users, 'id')
                    _.merge(self.users,userByKey);
                    //self.users = self.users.concat(users);
                    nextCursor = users.meta.nextCursor;
                    self.more = users.meta.more;
                    totalUsers = users.meta.totalCount;
                })
                .finally(function() {
                    self.isLoading = false;
                    // return loaded users
                    deferred.resolve(newUsers);
            });
            return deferred.promise;
        }
        
        /*****************************************************************
         * Load the first batch (speed things up)
         */
        $timeout(self.loadMoreUsers(),250);


        /*****************************************************************
         * Returns a user either by id, key, username, or index.
         * If the user is not already downloaded null or undefined is
         * returned.
         * If a it should get or update a user from the server use
         * getAsync().
         *
         * Parameters:
         * - options: {id:int ,key:str ,username:str ,index:int}
         *
         * Returns:
         * - user : user (as a promise)
         */
        this.get = function(options){
            $log.debug("[gaUsers:get] start ")
            options = typeof options !== 'undefined' ? options : {};
            _.defaults(options,{id:null,
                                key:null,
                                username:null,
                                index:null})
            if (options.index !== null){
                var userSorted = _.orderBy(self.users,'modified','desc');
                return userSorted[options.index];
            }
            if (options.id !== null){
                return self.users[options.id];
            }
            if (options.key !== null){
                return _.find(self.users['key',options.key]);
            }
            if (options.key !== null){
                return _.find(self.users['username',options.username]);
            }
        }

        /*****************************************************************
         * Returns a promies which resolves a user depending on the given
         * option (id, key, username, or index).
         * If a user is not already available offline it gets it from the
         * server.
         * If the uptdate option is set it reloads the user anyway.
         *
         * Parameters:
         * - options: {id:int ,key:str ,username:str ,index:int,
         *              update:false}
         *
         * Returns:
         * - user : user (as a promise)
         */
        this.getAsync = function(options){
            $log.debug("[gaUsers:getAsync] start ")
            options = typeof options !== 'undefined' ? options : {};
            _.defaults(options,{id:null,
                                key:null,
                                username:null,
                                index:null,
                                update:false})
            self = this;
            var deferred = $q.defer();
            var user = self.get(options);
            if (user && ! options.update){
                deferred.resolve(user);
            } else {
            // TODO get it online
            }
            return deferred.promise;
        }

        this.getTotalUsers = function(){
            $log.debug("[gaUsers:getTotalUsers] start ")
            $log.debug("[gaUsers:getTotalUsers] total users: "+totalUsers)
            return totalUsers;
        }
    });

}());
