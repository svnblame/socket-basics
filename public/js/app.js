var socket = io();

socket.on('connect', function() {
	console.log('Connected to socket.io server...'); 
});

socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp).local().format('MMM Do YYYY, h:mm:ss a');
	console.log(momentTimestamp + ': ' + message.text);
	
	jQuery('#messageBox').append('<p><strong>' + momentTimestamp + ': </strong>' + message.text + '</p>');
});

// Handle submiting of new message
var $form = jQuery('#message-form');

$form.on('submit', function(event) {
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		text: $message.val()
	});

	$message.val('');
});