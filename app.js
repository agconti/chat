var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var r = require('redis').createClient();

// Configure app

// set static file routing
app.use(express.static(__dirname + '/public'));

// set port to default to env settings for heroku
// or localhost settings.
app.set('port', (process.env.PORT || 3000));

// app routing
app.get('/', function(req, res){
  res.sendfile('index.html');
});

// log server port to console
server.listen(app.get('port'), function(){
  console.log('listening on ' + app.get('port'));
});


// log redis errors to console for easy debugging
r.on("error", function (err) {
    console.log("Error " + err);
});

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;


io.on('connection', function(socket){
  var addedUser = false;

  // reply with message and username.
  socket.on('newMessage', function(msg){
    socket.broadcast.emit("new message", {
      username: socket.username,
      message: msg
    });
  });

   socket.on('addUser', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the socket emits 'stop typing', we broadcast it to others
  socket.on('stopTyping', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

});



