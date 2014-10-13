var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis');
var client = redis.createClient();

// Configure app

// set static file routing
app.use(express.static(__dirname));

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
client.on("error", function (err) {
    console.log("Error " + err);
});

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;


io.on('connection', function(client){
  var addedUser = false;

  // reply with message and username.
  client.on('new message', function(msg){
    client.broadcast.emit("new message", {
      username: client.username,
      message: msg
    });
  });

   client.on('add user', function (username) {
    // we store the username in the socket session for this client
    client.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    client.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    client.broadcast.emit('user joined', {
      username: client.username,
      numUsers: numUsers
    });
  });

  // get user username
  client.on('join', function(name) {
    client.username = name;
    client.broadcast.emit("chat", name + " joined the chat");
    console.log(client.name + " joined!");
  });

  // when the user disconnects.. perform this
  client.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[client.username];
      --numUsers;

      // echo globally that this client has left
      client.broadcast.emit('user left', {
        username: client.username,
        numUsers: numUsers
      });
    }
  });

});



