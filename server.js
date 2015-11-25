var PORT = process.env.PORT || 3000;
var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

// Send current users to provided socket
function sendCurrentUsers(socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if(typeof info === 'undefined') {
		return;
	}

	Object.keys(clientInfo).forEach(function(socketId) {
		var userInfo = clientInfo[socketId];

		if (info.room === userInfo.room) {
			users.push(userInfo.name);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	});
}

io.on('connection', function(socket) {
	var timestamp = moment().valueOf();
	var momentTimestamp = moment.utc(timestamp).local().format('MMM Do YYYY, h:mm:ss a');
	console.log(momentTimestamp + ': Client connected via socket.io');

	socket.on('disconnect', function() {
		var userData = clientInfo[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function(req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function(message) {
		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			// Set timestamp property on message to JS timestamp
			// (millisecond version of Unix timestamp)
			message.timestamp = moment().valueOf();
			// Send message to everyone connected except for sender
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Welcome to the chat application!',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function() {
	console.log('Server started...');
});