var PORT = process.env.PORT || 3000;
var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

io.on('connection', function(socket) {
	var timestamp = moment().valueOf();
	var momentTimestamp = moment.utc(timestamp).local().format('MMM Do YYYY, h:mm:ss a');
	console.log(momentTimestamp + ': Client connected via socket.io');

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

		// Set timestamp property on message to JS timestamp (millisecond version of Unix timestamp)
		message.timestamp = moment().valueOf();

		var momentTimestamp = moment.utc(message.timestamp).local().format('MMM Do YYYY, h:mm:ss a');
		console.log(momentTimestamp + ': ' + message.text);

		// Send message to everyone connected except for sender
		io.to(clientInfo[socket.id].room).emit('message', message);
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