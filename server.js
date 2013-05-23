var net = require('net');
var messages = require('./messages.js');
var cli = require('./cli.js');

var host = '127.0.0.1';
var port = cli.portNum;
var routingTable = [];
var maxRoutes = 2;

function requestConnection(socket) {
	if (routingTable.length >= maxRoutes) {
		return messages.getRouteList(routingTable);
	}
	routingTable.push({ socket: socket, listeningPort: 0 });
	return messages.connAckMsg;
}

exports.start = function() {

	server = net.createServer( function(socket) {
		var message = requestConnection(socket);
		
		socket.write(JSON.stringify(message));
		
	});

	server.on('listening',function() {
		console.log('Listening on '+host+':'+port);
	});

	server.on('error', function(e) {
		if (e.code == 'EADDRINUSE') {
			console.log('Address in use, retrying...');
			port++;
			setTimeout(function () {
			  server.listen(port);
			}, 100);
		}
	});

	server.listen(port);
}