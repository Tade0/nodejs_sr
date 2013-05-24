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

function disconnect(socket)
{
	var sockets = routingTable.map( function(item) {
		return item.socket;
	});
	var i = sockets.indexOf(socket);
	if (i != -1)
	{
		routingTable.splice(i,1);
		console.log(i+" disconnected");
	}
}

function processMessage(data)
{
	switch(data.type)
	{
		case 'hi':
			routingTable.forEach( function(record) {
				if (record.socket == socket)
				{
					record.listeningPort = data.port;
				}
			});
		break;
		case 'hello':
			socket.write(JSON.stringify(messages.getGreetingMsg(port)));
		break;
	}
}

exports.start = function() {

	server = net.createServer( function(socket) {
		var message = requestConnection(socket);
		
		socket.write(JSON.stringify(message));
		
		// 
		socket.on('data', function(data) {
			console.log(data.toString());
			data = JSON.parse(data.toString());
			processMessage(data);
		});
		
		// Rozłączenie
		socket.on('error', function() {
			disconnect(socket);
		});
		
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