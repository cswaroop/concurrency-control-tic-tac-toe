'use strict';

var async = require('async');
var asConfig = require('./aerospike_config');
var aerospikeConfig = asConfig.aerospikeConfig();
var aerospikeDBParams = asConfig.aerospikeDBParams();
var aerospike = require('aerospike');

// Connect to the cluster
var client = aerospike.client(aerospikeConfig);
client.connect(function (response) {
  if ( response.code === 0) {
    // handle success
    console.log("\nConnection to Aerospike cluster succeeded!\n");
  }
  else {
    // handle failure
    console.log("\nConnection to Aerospike cluster failed!\n");
    console.log(response);
  }
});

function incrementAPIUsageCounter(username, apiMethod, apiKey, apiParams) {
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.usersTable,username);
  var operator = aerospike.operator;
  var operations = [operator.incr('apicounter', 1),operator.read('apicounter')];
  client.operate(key, operations, function(err, bins, metadata, key) {
      // Check for errors
      if ( err.code === aerospike.status.AEROSPIKE_OK ) {
        // handle success
        // console.error('incrementAPIUsageCounter success: ', bins);

        //Log API usage for admin/reporting purposes
        key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.usageTable,username+":usage:"+bins.apicounter);
        client.put(key, {api: apiMethod, key: apiKey, params: apiParams}, function(err, rec, meta) {
          // Check for errors
          if ( err.code === aerospike.status.AEROSPIKE_OK ) {
            // console.error('Log API usage success');
          }
          else {
            // An error occurred
            console.error('Log API usage error: ', err);
          }
        });
      }
      else {
        // handle failure
        console.error('incrementAPIUsageCounter error: ', err);
      }
  });
}

function test() {
  var key = aerospike.key("test", "test", "test");
  var record = {hello: "world"};
  client.put(key, record, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK ) {
      // The record was successfully created
      console.error('test record created!');
    }
    else {
      // An error occurred
      console.error('addObject error:', err);
    }
  });
}

// APP APIs ////////////////////////////////

exports.checkUsername = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.usersTable,params.username);
  client.get(key, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK ) {
      // The record was successfully read.
      console.log(rec);
      res.json({status : 'Ok', uid : rec.uid, auth: rec.auth});
    }
    else {
      // An error occurred
      console.error('checkUsername error: ', err);
      res.json({status: 'Invalid Username'});
    }
  });
};

exports.checkPassword = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.usersTable,params.uid);
  client.get(key, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK && rec.password === params.password) {
      // The record was successfully read.
      console.log(rec, meta);
      res.json({status : 'Ok', auth: rec.auth});
    }
    else {
      // An error occurred
      console.error('checkPassword error: ', err);
      res.json({status: 'Invalid Password'});
    }
  });
};

exports.createUser = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.usersTable,params.uid);
  var userRecord = {uid: params.uid, username: params.username, password: params.password, auth: params.auth};
  client.put(key, userRecord, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK ) {
      // The record was successfully created.
      // console.log(rec, meta);
      res.json({status : 'Ok'});
    }
    else {
      // An error occurred
      console.error('createUser error: ', err);
      res.json({status: err});
    }
  });
};

exports.createGame = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.gamesTable,params.gameKey);
  var userRecord = {gameKey: params.gameKey, initiated: params.initiated, opponent: params.opponent, status: "PENDING", turn: params.opponent, winner: "", TopLeft: "", TopMiddle: "", TopRight: "", MiddleLeft: "", MiddleMiddle: "", MiddleRight: "", BottomLeft: "", BottomMiddle: "", BottomRight: ""};
  client.put(key, userRecord, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK ) {
      // The record was successfully created.
      // console.log(rec);
      res.json({status : 'Ok'});
    }
    else {
      // An error occurred
      console.error('createGame error: ', err);
      res.json({status: err});
    }
  });
};

exports.retrieveGame = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.gamesTable,params.key);
  // console.log(key);
  client.get(key, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK) {
      // The record was successfully read.
      console.log(rec);
      if (rec.initiated === params.username || rec.opponent === params.username)  {
        res.json({status : 'Ok', game: rec});
      } else  {
        res.json({status : 'Invalid Game key!'});
      }
    }
    else {
      // An error occurred
      console.error('retrieveGame error: ', err);
      res.json({status: 'Invalid Game key!'});
    }
  });
};

exports.acceptGame = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.gamesTable,params.key);
  // console.log(key);
  client.get(key, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK) {
      // The record was successfully read.
      // console.log(rec);
      var operator = aerospike.operator;
      var operations = [operator.write('status', 'IN_PROGRESS'),operator.read('status')];
      client.operate(key, operations, function(err, bins, metadata, key) {
        if ( err.code === aerospike.status.AEROSPIKE_OK) {
          res.json({status : 'Ok', gamestatus: bins.status});
        } else  {
          res.json({status: err});
        }
      });
    }
    else {
      // An error occurred
      console.error('retrieveGame error: ', err);
      res.json({status: 'Invalid Game key!'});
    }
  });
};

exports.updateGameViaUDF = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var file = './lib/udf/updateGame.lua';

  client.udfRegister(file, function(err) {
    // console.log(err);
    if ( err.code === aerospike.status.AEROSPIKE_OK) {
      var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.gamesTable,params.key);  
      var udf = { module:'updateGame', funcname: 'update', args: [params.username, params.square]};
      client.execute(key, udf, function(err, result) {
        if ( err.code === aerospike.status.AEROSPIKE_OK) {
          console.log(result);
          if (result.status == 0) {
            res.json({status : 'Ok'});
          } else  {
            res.json({status: result.message});
          }
        } else  {
          res.json({status: err});
        }
      });
    } else  {
      res.json({status: err});
    }
  });
};

exports.updateGame = function(req, res) {
  // console.log(req.body);
  var params = req.body;
  var key = aerospike.key(aerospikeDBParams.dbName,aerospikeDBParams.gamesTable,params.key);
  // console.log(key);
  client.get(key, function(err, rec, meta) {
    // Check for errors
    if ( err.code === aerospike.status.AEROSPIKE_OK) {
      // The record was successfully read.
      // console.log(rec);

      // STEP: check if the game is over == won
      if (rec.status === 'DUNZZO')  {
        res.json({status: "THIS GAME IS DUNNZO -- " + (rec.winner === '' ? "NO WINNER!" : "WINNER IS " + rec.winner)});
        return;
      } 

      // STEP: check if it is current user's turn
      if (rec.turn !== params.username)  {
        res.json({status: "It is " + rec.turn + "'s turn. NOT YOURS!"});
        return;
      } 

      // STEP: check if the selected square is already taken
      if (rec[params.square] !== '')  {
        res.json({status: "That square is already taken. CAN'T BE YOURS!"});
        return;
      } 

      var bins = {};
      // Update Square
      bins[params.square] = params.username;  
      // Update whose turn it will be next
      if (rec.turn === rec.initiated)  {
        bins['turn'] = rec.opponent;
      } else {
        bins['turn'] = rec.initiated;
      }

      client.put(key, bins, function(err, rec, meta) {
        if ( err.code === aerospike.status.AEROSPIKE_OK ) {
          // The record was successfully updated

          // Send back updated game record
          client.get(key, function(err, rec, meta) {
            if ( err.code === aerospike.status.AEROSPIKE_OK ) {

              bins = {};
              // Update status 
              var status = null;
              var winner = null;
              // STEPS: check if the game is over == we have a WINNER 
              if (rec.TopLeft === rec.TopMiddle && rec.TopLeft === rec.TopRight) {
                if (rec.TopLeft !== '') {
                  status = "DUNZZO";
                  winner = rec.TopLeft;
                }
              } else if (rec.MiddleLeft === rec.MiddleMiddle && rec.MiddleLeft === rec.MiddleRight) {
                if (rec.MiddleLeft !== '') {
                  status = "DUNZZO";
                  winner = rec.MiddleLeft;
                }
              } else if (rec.BottomLeft === rec.BottomMiddle && rec.BottomLeft === rec.BottomRight) {
                if (rec.BottomLeft !== '') {
                  status = "DUNZZO";
                  winner = rec.BottomLeft;
                }
              } else if (rec.TopLeft === rec.MiddleLeft && rec.TopLeft === rec.BottomLeft) {
                if (rec.TopLeft !== '') {
                  status = "DUNZZO";
                  winner = rec.TopLeft;
                }
              } else if (rec.TopMiddle === rec.MiddleMiddle && rec.TopMiddle === rec.BottomMiddle) {
                if (rec.TopMiddle !== '') {
                  status = "DUNZZO";
                  winner = rec.TopMiddle;
                }
              } else if (rec.TopRight === rec.MiddleRight && rec.TopRight === rec.BottomRight) {
                if (rec.TopRight !== '') {
                  status = "DUNZZO";
                  winner = rec.TopRight;
                }
              } else if (rec.TopLeft === rec.MiddleMiddle && rec.TopLeft === rec.BottomRight) {
                if (rec.TopLeft !== '') {
                  status = "DUNZZO";
                  winner = rec.TopLeft;
                }
              } else if (rec.TopLeft !== '' && rec.TopMiddle !== '' && rec.TopRight !== '' && rec.MiddleLeft !== '' && rec.MiddleMiddle !== '' && rec.MiddleRight !== '' && rec.BottomLeft !== '' && rec.BottomMiddle !== '' && rec.BottomRight !== '')  {
                  status = "DUNZZO";
              } 

              var operator = aerospike.operator;
              var operations = [];
              if (status !== null)  {
                operations.push(operator.write('status', status),operator.read('status'));
              }
              if (winner !== null)  {
                operations.push(operator.write('winner', winner),operator.read('winner'));
              }

              if (operations.length > 0)  {
                client.operate(key, operations, function(err, bins, metadata, key) {
                  if ( err.code === aerospike.status.AEROSPIKE_OK ) {
                    rec.status = bins.status;
                    rec.winner = bins.winner;
                    res.json({status : 'Ok', game: rec});
                  } else {
                    res.json({status : err});
                  }
                });
              } else {
                res.json({status : 'Ok', game: rec});
              }

            } else {
              res.json({status: err});
            }
          });

        }
        else {
          // An error occurred
          res.json({status: err});
        }
      });
    }
    else {
      // An error occurred
      console.error('retrieveGame error: ', err);
      res.json({status: 'Invalid Game key!'});
    }
  });
};
