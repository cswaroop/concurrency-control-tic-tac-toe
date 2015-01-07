'use strict';

function UUID(){}UUID.generate=function(){var a=UUID._gri,b=UUID._ha;return b(a(32),8)+"-"+b(a(16),4)+"-"+b(16384|a(12),4)+"-"+b(32768|a(14),4)+"-"+b(a(48),12)};UUID._gri=function(a){return 0>a?NaN:30>=a?0|Math.random()*(1<<a):53>=a?(0|1073741824*Math.random())+1073741824*(0|Math.random()*(1<<a-30)):NaN};UUID._ha=function(a,b){for(var c=a.toString(16),d=b-c.length,e="0";0<d;d>>>=1,e+=e)d&1&&(c=e+c);return c};

angular.module('tictactoeApp')
  .factory('game', ['$q', '$http', '$rootScope', 'localStorageService', function ($q, $http, $rootScope, localStorageService) {

    // Public API

    var create = function(game, callback) {
      var cb = callback || angular.noop;
      // var deferred = $q.defer();

      if (game.opponent === undefined || game.opponent === null || game.opponent.trim().length === 0)  {
        return cb({message : 'Please provide username of the opponent'});
      }

      var gameKey = UUID.generate();
      $http.post('/api/createGame', {gameKey: gameKey, initiated: game.initiated, opponent: game.opponent}).success(function(response) {
        if (response.status === 'Ok'){
          return cb({status : 'Ok', gameKey: gameKey});
        } else {
          return cb({message : response.status});
        }
      });
      // return deferred.promise;
    };

    var retrieve = function(game, callback) {
      var cb = callback || angular.noop;
      // var deferred = $q.defer();

      if (game.key === undefined || game.key === null || game.key.trim().length === 0)  {
        return cb({message : 'Please provide Game Key'});
      }

      $http.post('/api/retrieveGame', {key: game.key, username: game.username}).success(function(response) {
        if (response.status === 'Ok'){
          return cb({status : 'Ok', game: response.game});
        } else {
          return cb({message : response.status});
        }
      });
      // return deferred.promise;
    };

    var accept = function(game, callback) {
      var cb = callback || angular.noop;
      // var deferred = $q.defer();

      if (game.key === undefined || game.key === null || game.key.trim().length === 0)  {
        return cb({message : 'Please provide Game Key'});
      }

      $http.post('/api/acceptGame', {key: game.key}).success(function(response) {
        if (response.status === 'Ok'){
          return cb({status : 'Ok', gamestatus: response.gamestatus});
        } else {
          return cb({message : response.status});
        }
      });
      // return deferred.promise;
    };

    var update = function(game, callback) {
      var cb = callback || angular.noop;
      // var deferred = $q.defer();

      if (game.key === undefined || game.key === null || game.key.trim().length === 0)  {
        return cb({message : 'Please provide Game Key'});
      }

      var updateAPI = 'updateGameViaUDF'; //updateGame

      $http.post('/api/'+updateAPI, {key: game.key, square: game.square, username: game.username}).success(function(response) {
        if (response.status === 'Ok'){
          return cb({status : 'Ok'});
        } else {
          return cb({message : response.status});
        }
      });
      // return deferred.promise;
    };

    return {
      create: create,
      retrieve: retrieve,
      accept: accept,
      update: update
    };

  }]);
