var WebSocketServer = require('websocket').server;
var http = require('http');
var messages = require('../messages.js');
var cli = require('../cli.js');
var connection;

exports.init = function() { console.log("Monitor not activated"); };

if (cli.monitor)
{

	var server = http.createServer(function(request, response) {});
	server.listen(1337, function() { });

	// create the server
	wsServer = new WebSocketServer({
		httpServer: server
	});

	// WebSocket server
	wsServer.on('request', function(request) {
		debugger;
		if (connection)
		{
			request.reject();
			//requester = request.accept(null, request.origin);
			//requester.sendUTF("xxx");
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
					case "getAll":
						response = "getting...";
						var to = [name];
						routingTable.forEach( function(item) {
							to.push(item.name);
						});
						exports.eventEmitter.emit('processMessage',messages.getRoutingTableMsg([]));
					break;
				}
				connection.sendUTF(JSON.stringify(response));
			}
		});

		connection.on('close', function(socket) {
			debugger;
			console.log("closed");
			connection = false;
		});
		connection.on('error', function(socket) {
			console.log("closed");
			connection = false;
		});		
	});

	exports.init = function() {

		exports.eventEmitter.on('reply', function(data) {
			switch (data.payload.type)
			{
				case messages.ROUTING_TABLE:
					connection.sendUTF(JSON.stringify({type: messages.ROUTING_TABLE,name: data.payload.name, table: data.payload.table}));
				break;
			}
		});
	}
}