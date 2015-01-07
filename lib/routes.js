'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server APP API 
  app.route('/api/checkUsername')
    .post(api.checkUsername);
  app.route('/api/checkPassword')
    .post(api.checkPassword);
  app.route('/api/createUser')
    .post(api.createUser);
  app.route('/api/createGame')
    .post(api.createGame);
  app.route('/api/retrieveGame')
    .post(api.retrieveGame);
  app.route('/api/acceptGame')
    .post(api.acceptGame);
  app.route('/api/updateGame')
    .post(api.updateGame);
  app.route('/api/updateGameViaUDF')
    .post(api.updateGameViaUDF);

  // All undefined api routes should return a 404
  app.route('/api/*')
    .get(function(req, res) {
      res.send(404);
    });

  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( index.index);
};