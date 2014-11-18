var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var User = require('./db/User.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var port = process.env.PORT || 3000;
server.listen(port);
console.log('event server listening on port %s', port);

require('./db/connection.js');

app.use(express.static('public'));
app.use(session( {secret: 'eventsauce', key: 'event.sid'} ));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

io.set('authorization', function(handshakeData, accept) {
  var parse = cookieParser('eventsauce');
  parse(handshakeData, null, function(){
    console.log(handshakeData.cookies);
    console.log(handshakeData.signedCookies);
    accept();
  })
})

io.on('connection', function (socket) {

  socket.on('auth', function (data){
    console.log('socket:');
    console.log(socket);
    User.findOne({ username: data.username }, function(err, user) {
      console.log(user);
      if (user) {
        user.socket_id = socket.id;
        user.save(function(){
          socket.emit('success', { message: 'User socket_id successfully updated' });
        });
        socket.emit('err', { message: 'That user already exists!' });
      } else {
        new User({
          username: data.username,
          socket_id: socket.id
        }).save(function(err, user) {
          console.log('Added user to database:');
          console.log(user);
          socket.emit('success', { message: 'User successfully added to database!' });
        });
      }
    })
  });

  socket.on('disconnect', function() {
    console.log('disconnect');
    User.findOne({ socket_id: socket.id }, function(err, user) {
      if (user) {
        user.socket_id = null;
        user.save();
      }
    })
  })

});

setInterval(function(){
  User.find({}, function(err, users) {
    for (var i = 0; i < users.length; i++) {
      io.to(users[i].socket_id).emit('test', {msg: 'You\'re receiving this message because your socket is ' + users[i].id});
    };
  });
}, 5000);