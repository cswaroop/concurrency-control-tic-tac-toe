'use strict';

angular.module('tictactoeApp')
  .controller('RegisterCtrl', ['$scope', '$location', 'user', 'auth', 'localStorageService', function ($scope, $location, user, auth, localStorageService) {
    $scope.user = {};
    $scope.errors = null;

    var authKey = 'auth';
    var uidKey = 'uid';

    $scope.register = function(form) {
      $scope.submitted = true;
      
      if(form.$valid) {
        user.create({
          email: $scope.user.email,
          password: $scope.user.password
        }, function(response) {
					// console.log('auth.login callback: ' + JSON.stringify(response));
					if (response && response.status === 'Ok') {
						$location.path('/home');
					} else {
	          $scope.errors = response.message;
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