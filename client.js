var WebSocketServer = require('websocket').server;
var messages = require('./messages.js');
var http = require('http');
var connection = false;
var port = 30000;

var server = http.createServer(function(request, response) {});
server.on('error', function(e) {
		if (e.code == 'EADDRINUSE') {
			console.log('\x1b[33;1mAddress in use, retrying...\x1b[0m');
			port++;
			setTimeout(function () {
				server.listen(port);
			}, 100);
		}
	});
server.listen(port);

server.on('listening',function() {
	console.log('Chat client listening on port \x1b[34;1m'+port+'\x1b[0m');

	// create the server
	wsServer = new WebSocketServer({
		httpServer: server
	});

	// WebSocket server
	wsServer.on('request', function(request) {
		if (connection)
		{
			setTimeout( function() { if (connection) request.reject(); },200);
		}
		else
		{
			connection = request.accept(null, request.origin);
		}

		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				var msg = JSON.parse(message.utf8Data);
				var response = {};
				
				switch(msg.command) {
					case "test":
						response = "test";
					break;
					case "post":
						debugger;
						exports.eventEmitter.emit('processMessage',
						messages.getBroadcastMsg(messages.getPostMsg(
							{text: msg.text, topic: "", time: exports.clock.tick(name).time, name: name }
						), [], false));
						
					break;
				}
				// process WebSocket message
				connection.sendUTF(JSON.stringify(response));
			}
		});

		connection.on('close', function(connection) {
			debugger;
			connection = false;
		});
		
		connection.on('error', function(connection) {
			debugger;
			connection = false;
		});
	});

});

exports.init = function() {

	exports.eventEmitter.on('chat', function(data) {
		if (connection)
		{
			connection.send(data);
		}
	});
}
