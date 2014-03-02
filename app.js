var express = require('express'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  config = require('./config/config'),
  http = require('http');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);

var server = http.createServer(app);

server.listen(config.port);

var io = require('socket.io').listen(server);
var rooms = {};

io.sockets.on('connection', function (socket) {

    socket.on('c2s', function (data) {
        if(!rooms[data.room]) {
            rooms[data.room] = data.key;
        } else {
            socket.emit(data.key, {
                key: rooms[data.room]
            });
        }
    });
});