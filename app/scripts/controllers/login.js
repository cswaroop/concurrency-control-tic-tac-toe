'use strict';

angular.module('tictactoeApp')
  .controller('LoginCtrl', ['$scope', '$location', 'auth', 'localStorageService', 'user', function ($scope, $location, auth, localStorageService, user) {
    $scope.user = {};
    $scope.errors = null;

    var authKey = 'auth';
    var uidKey = 'uid';

    $scope.login = function(form) {
      if(form.$valid) {
        auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        }, function(response) {
					// console.log('auth.login callback: ' + JSON.stringify(response));
					if (response && response.status === 'Ok') {
						$location.path('/home');
					} else {
	          $scope.errors = 'Invalid Credentials. Please try again!';
					}
        });
        // .then( function() {
          // Logged in, redirect to home
          // $location.path('/');
        // })
        // .catch( function(err) {
          // err = err.data;
          // $scope.errors.other = err.message;
        // });
      }
    };

  }]);
