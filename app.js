// Init
	var express = require('express');
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

// Static Files
	app.use('/images', express.static(__dirname + '/images'));
	app.use('/css', express.static(__dirname + '/css'));

// Variables
	var users = {};
	var current_vid = {};
	var msgs = {
		connect: '[System] A new user has connected.',
		disconnect: '[System] A user has disconnected.'
	}

// Server
	app.get('/', function(req, res){
		res.sendFile(__dirname + '/index.html');
	});

// Application Functions
io.on('connection', function(socket){
	// New user connected
		io.emit('user-enter', socket.id);
		console.log(msgs.connect);
		users[socket.id] = {id:socket.id, name:''};

	socket.on('get-video' ,function(){
		socket.emit('set-video', current_vid);
		console.log('pushing current video to user '+socket.id);
	});
	socket.on('get-users' ,function(){
		socket.emit('set-users', users);
		console.log('pushing users list to user '+socket.id);
	});

	socket.on('share-vid' ,function(vid){
		current_vid.id = vid;
		current_vid.user_id = socket.id;
		current_vid.timestamp = Date.now();
		console.log(current_vid);
		io.emit('set-video', current_vid);
	});

	socket.on('rename', function(name){
		users[socket.id].name = name;
		io.emit('set-name', {user_id:socket.id, name:name});
	});

	socket.on('chat', function(data){
		console.log('[ ['+socket.id+'] '+data);
		io.emit('recieve-chat', {uid:socket.id, message:data});
	});

	socket.on('seek', function(pos){
		console.log('# Seeking to ')
	});

	socket.on('disconnect', function(){
		io.emit('user-leave', socket.id);
		delete users[socket.id];
		console.log(msgs.disconnect);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
