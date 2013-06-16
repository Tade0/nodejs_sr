var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
		if (message.type === 'utf8') {
			var msg = JSON.parse(message.utf8Data);
			var response = {};
			
			switch(msg.command) {
				case "test":
					response = "test";
				break;
			}
			// process WebSocket message
			connection.sendUTF(JSON.stringify(response));
		}
    });

    connection.on('close', function(connection) {
    });
});

exports.init = function() {

	exports.eventEmitter.on('reply', function(data) {
		
	});
}