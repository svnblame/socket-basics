var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room') || 'Empty Room';
var socket = io();

// Update room title
jQuery('#room-title').text(room);

socket.on('connect', function() {
	console.log(name + ' joined ' + room); 
	socket.emit('joinRoom', {
		name: name,
		room: room
	});
});

socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp).local().format('MMM Do YYYY, h:mm:ss a');
	console.log(momentTimestamp + ': ' + message.text);

	$message = jQuery('#messageBox');
	$message.append('<p><strong>' + message.name + ' ' + momentTimestamp + '</strong></p>');
	$message.append('<p>' + message.text + '</p>');
});

// Handle submiting of new message
var $form = jQuery('#message-form');

$form.on('submit', function(event) {
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		name: name,
		text: $message.val()
	});

	$message.val('');
});