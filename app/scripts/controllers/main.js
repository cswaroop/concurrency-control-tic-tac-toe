'use strict';

angular.module('tictactoeApp')
  .controller('MainCtrl', ['$scope', 'localStorageService', '$http', 'socket', '$modal', 'user', 'game', function ($scope, localStorageService, $http, socket, $modal, user, game) {

    $scope.game = {key: localStorageService.get('newkey')};
    $scope.playErrors = null;
    $scope.keyErrors = null;
    $scope.gameStats = {};
		$scope.username = localStorageService.get('uid');

    $scope.init = function() {
      $scope.retrieveGame();

      // Start timer to refresh
      refreshGameTimer = setInterval(function()  {
        if (refreshGameCounter <= 60) {
          refreshGameCounter++;
          $scope.retrieveGame();
        } else  {
          if (refreshGameTimer) {
            clearInterval(refreshGameTimer);
          }
        }
      }, 1500);
    };

    $scope.retrieveGame = function() {
      if ($scope.game.key)  {
        $scope.keyErrors = null;
        $scope.playErrors = null;
        game.retrieve({
          key: $scope.game.key,
          username: $scope.username
        }, function(response) {
          // console.log(response);
          if (response && response.status === 'Ok') {
            $scope.gameStats = response.game;
            // $scope.game.key = "";
          } else {
            $scope.keyErrors = response.message;
          }
        });
      }
    };

    $scope.acceptGame = function(form) {
      $scope.playErrors = null;
      if(form.$valid) {
        game.accept({
          key: $scope.gameStats.gameKey
        }, function(response) {
          // console.log(response);
          if (response && response.status === 'Ok') {
            $scope.gameStats.status = response.gamestatus;
          } else {
            $scope.playErrors = response.message;
          }
        });
      }
    };

    $scope.updateGame = function(form,square) {
      $scope.playErrors = null;
      if(form.$valid) {
        game.update({
          key: $scope.gameStats.gameKey,
          username: $scope.username,
          square: square
        }, function(response) {
          // console.log(response);
          if (response && response.status === 'Ok') {
            $scope.playErrors = "Nice One!";
            // $scope.gameStats = response.game;
          } else {
            $scope.playErrors = response.message;
          }
        });
      }
    };

    $scope.$on('socket:broadcast', function (event,data) {
      // console.log(event);
      // console.log(data);

      //check if the new game invite is for the current user
      if (data.opponent && data.opponent === $scope.username) {
        $scope.game.key = data.gameKey;

        //store the latest key so it can be accessed on the main/Play page to retrieve the game
        localStorageService.set('newkey', $scope.game.key);
      }
    });

  }]);
