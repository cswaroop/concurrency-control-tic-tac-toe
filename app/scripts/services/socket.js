'use strict';

angular.module('tictactoeApp')
  .factory('socket', ['$rootScope','socketFactory', function ($rootScope,socketFactory) {
    var socket = socketFactory();

    //forward 'broadcast' event to $rootScope
    socket.forward('broadcast');
    return socket;
	}]);
