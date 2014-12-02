var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var User = require('./db/User.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var permissions = require('./permissions.js');

var port = process.env.PORT || 3000;
server.listen(port);
console.log('event server listening on port %s', port);

require('./db/connection.js');

app.use(express.static('public'));
app.use(session( {secret: 'eventsauce', key: 'event.sid'} ));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

io.use(permissions);

io.on('connection', function (socket) {

  // Express middleware, such as cookie-parser, expect f(req, res, next)
  // Cookie parser modifies the request object in place by 
  cookieParser('eventsauce')(socket.handshake, null, function(){})

  var socket_id = socket.id;
  var session_id = socket.handshake.signedCookies['event.sid'];

  // Update this user's socket association if they have a session
  if (socket_id && session_id) {
    User.findOne({ session_id: session_id }, function(err, user) {
      if (user) {
        user.socket_id = socket_id;
        user.save();
      }
    })
  }

  socket.on('test', function() {
    console.log('test!');
  })

  socket.on('auth', function (data){

    // Check if a user exists with provided email
    User.findOne({ email: data.email }, function(err, user) {
      if (user) {
        user.socket_id = socket_id;
        user.session_id = session_id;
        user.save(function(){
          socket.emit('success', { message: 'User auth data successfully updated!' });
        });
      } else {
        new User({
          email: data.email,
          username: data.username,
          socket_id: socket_id,
          session_id: session_id
        }).save(function(err, user) {
          console.log('Added user to database:');
          console.log(user);
          socket.emit('success', { message: 'User account successfully created!' });
        });
      }
    })
  });

  socket.on('disconnect', function() {
    User.findOne({ socket_id: socket_id }, function(err, user) {
      if (user) {
        user.socket_id = null;
        user.save();
      }
    });
  })

});

setInterval(function(){
  User.find({ socket_id: {'$ne': null } }, function(err, users) {
    for (var i = 0; i < users.length; i++) {
      console.log('Emitting event to %s', users[i].socket_id);
      io.to(users[i].socket_id).emit('test', {msg: 'You\'re receiving this message because your socket is ' + users[i].socket_id});
    };
  });
}, 5000);