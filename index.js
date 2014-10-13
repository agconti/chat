var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var client = redis.createClient();

// log redis errors to console for easy debugging
client.on("error", function (err) {
    console.log("Error " + err);
});

// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     client.quit();
// });

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(client){

  // get user nick name
  client.on('join', function(name) {
    client.nickname = name;
    client.broadcast.emit("chat", name + " joined the chat");
  });

  // reply with message and nickname.
  client.on('chat message', function(msg){
    client.broadcast.emit("chat message", client.name + ": " + msg);
  });
});

// log server to console
http.listen(3000, function(){
  console.log('listening on *:3000');
});
