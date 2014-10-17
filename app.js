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
// var usernames = {};
// var numUsers = 0;

// intialize redis
var roomName = 'room:chat1',
    hashStructure = {
      'active_users': '[{"username": "John_Johnson"}]',
      'messages': '[{"username": "John_Johnson", "message":"Hi Im John_Johnson."}]',
      'numUsers': '1'
    };
r.hmset(roomName, hashStructure);

function redisLog(err, resp){
  console.log('redis log:');
  for(x in resp){
    console.log(x);
    console.log(resp[x]);
  }
}

io.on('connection', function(socket){
  // var addedUser = false;
  r.hgetall(roomName, redisLog);

  // Get all messages and send them to client
  r.hget(roomName, 'messages', function(err, resp){
    debugger;
    var messages = JSON.parse(resp);
    console.log(resp);
    socket.emit('intializeMessages', messages);
  });

  // reply with message and username.
  socket.on('newMessage', function(msg){

    // update lastest messages.
    var messages;
    r.hget(roomName, 'messages', function(err, resp){
      debugger;

      messages = JSON.parse(resp);
      console.log(messages);
      messages.unshift(msg);
      // limts stored messages to last 50
      console.log(messages);
      messages.length(50);

      // needs to be converted to new json format.
      r.hset(roomName, 'messages', messages);
    });

    socket.broadcast.emit("newMessage", {
      username: socket.username,
      message: msg
    });

  });

   socket.on('addUser', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;

    // Get chat room data
    // active_users = r.hgetall(roomName, redisLog);
    r.hget(roomName, 'active_users', function(err, resp){
      console.log("resp " + resp);
      var active_users = JSON.parse(resp);
      // add the client's username to the room's active usernames
      var numUsers = active_users.push(username) || 1;
      r.hset(roomName, 'active_users', active_users, redisLog); 
      
      // ++numUsers;
      // addedUser = true;
      
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('userJoined', {
        username: socket.username,
        numUsers: numUsers
      });
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
    socket.broadcast.emit('stopTyping', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    // if (addedUser) {
    //   delete usernames[socket.username];
    //   --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('userLeft', {
        username: socket.username,
        numUsers: numUsers
      });
    // }
  });

});



