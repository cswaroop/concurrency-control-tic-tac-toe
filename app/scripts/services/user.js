'use strict';

function UUID(){}UUID.generate=function(){var a=UUID._gri,b=UUID._ha;return b(a(32),8)+"-"+b(a(16),4)+"-"+b(16384|a(12),4)+"-"+b(32768|a(14),4)+"-"+b(a(48),12)};UUID._gri=function(a){return 0>a?NaN:30>=a?0|Math.random()*(1<<a):53>=a?(0|1073741824*Math.random())+1073741824*(0|Math.random()*(1<<a-30)):NaN};UUID._ha=function(a,b){for(var c=a.toString(16),d=b-c.length,e="0";0<d;d>>>=1,e+=e)d&1&&(c=e+c);return c};

angular.module('tictactoeApp')
  .factory('user', ['$q', '$http', '$rootScope', 'localStorageService', function ($q, $http, $rootScope, localStorageService) {

    // Public API

    var create = function(user, callback) {
      var cb = callback || angular.noop;
      // var deferred = $q.defer();

      if (user.email === undefined || user.email === null || user.password === undefined || user.password === null || user.email.trim().length === 0 || user.password.trim().length === 0 )  {
        return cb({message : 'Please provide Username and Password!'});
      }

      ///Check username uniqueness
      $http.post('/api/checkUsername', {username: user.email}).success(function(response) {
        if (response.status !== 'Ok'){
          user.uid = user.email;
          user.auth = UUID.generate();
          $http.post('/api/createUser', {uid: user.uid, username: user.email, password: user.password, auth: user.auth, apicounter: 0}).success(function(uResponse) {
            // console.log('/api/createUser uResponse: ' + JSON.stringify(uResponse));
            if (uResponse.status === 'Ok'){
              localStorageService.set('uid',user.uid);
              localStorageService.set('auth',user.auth);
              $rootScope.currentUser = user;
              return cb({status : 'Ok', uid : user.uid, auth: user.auth});
            } else {
              return cb({message : 'Oops!'});
            }
          });
        } else {
          ///duplicate username
          return cb({message : 'Username is already taken. Please try another one!'});
        }
      });

      // return deferred.promise;
    };

    var checkUsername = function(user, callback) {
      var cb = callback || angular.noop;
      // var deferred = $q.defer();
      ///Check username 
      $http.post('/api/checkUsername', {username: user.email}).success(function(response) {
        if (response.status === 'Ok'){
          return cb({status : 'Ok', uid : response.uid, auth: response.auth});
        } else {
          return cb({message : 'Invalid Username. Please try another one!'});
        }
      });
      // return deferred.promise;
    };

    return {
      create: create,
      checkUsername: checkUsername
    };

  }]);
