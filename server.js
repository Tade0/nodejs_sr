var net = require('net');
var msg = require('./messages.js');
var cli = require('./cli.js');

var host = '127.0.0.1';
var port = cli.portNum;
var routingTable = [];
var maxRoutes = 3;

var client = new net.Socket();

function requestConnection(socket) {
	if (routingTable.length >= maxRoutes) {
		return msg.getRouteList(routingTable);
	}
	routingTable.push({ socket: socket, listeningPort: 0 });
	return msg.connAckMsg;
}

function disconnect(socket) {
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

function processMessage(data) {
	switch(data.type)
	{
		case msg.HI:
			routingTable.forEach( function(record) {
				if (record.socket == data.socket)
				{
					record.listeningPort = data.port;
				}
			});
		break;
		case msg.HELLO:
			client.write(JSON.stringify(msg.getGreetingMsg(port)));
		break;
		case msg.ROUTE_LIST:
			
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
			data.socket = socket;
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

exports.startClient = function() {
	debugger;
	if (cli.connect)
	{
		client.connect(cli.connectPort,cli.connectAddr, function() {
			console.log("Connected");
		});
		client.on('data', function(data) {
			console.log(data.toString());
			data = JSON.parse(data.toString());
			processMessage(data);
		});
		client.on('error', function(e) {
			console.log(e.code);
		});
	}
}