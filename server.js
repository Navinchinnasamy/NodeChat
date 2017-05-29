var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Initialize appication with route / (that means root of the application)
app.get('/', function(req, res){
	var express = require('express');
	app.use(express.static(path.join(__dirname)));
	res.sendFile(path.join(__dirname, '../chat', 'index-org.html'));
});

var clientlist = [];
var namespace = '/';
// Register events on socket connection
io.on('connection', function(socket){
	var address = socket.request.connection.remoteAddress;
		
	// List all socket ids'
	for (var socketId in io.nsps[namespace].adapter.rooms) {
		console.log("-----"+socketId);
	}
	
	socket.on('newUser', function(name, id){
		clientlist.push({
			'name': name,
			'id': id
		});
		console.log(clientlist);
		io.emit('onlineUsers', clientlist);
	});
	
	socket.on('disconnect', function(){
		clientlist = clientlist.filter(function(obj){
			return obj.id != socket.id;
		});
        console.log('User disconnected'+'\n');
		console.log(clientlist);
    });
	
	socket.on('chatMessage', function(from, to, msg){
		//console.log('chatMessage', from, msg);
		io.to(to).emit('chatMessage', from, msg);
		//io.emit('chatMessage', from, msg);
	});
	socket.on('notifyUser', function(user){
		//console.log('notifyUser', user);
		io.emit('notifyUser', user);
	});
});

//Listen the application requests on port 3000
http.listen('3001', function(){
	console.log('Listening on *:3001');
});