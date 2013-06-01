maxRoutes = 2;
routingTable = [];

var net = require('net');
var msg = require('./messages.js');
var cli = require('./cli.js');
var helper = require('./helper.js');
var event = require('./event.js');
var connection = require('./connection.js');

var host = '127.0.0.1';
var port = cli.portNum;


eventEmitter = event.eventManager;
client = connection.clientManager;

function requestConnection(socket) {
	if (routingTable.length >= maxRoutes) {
		return msg.getRouteList(routingTable);
	}
	routingTable.push({ socket: socket, listeningPort: 0 });
	if (routingTable.length > 0)
	{
		var item = routingTable[Math.floor(Math.random()*(routingTable.length-1))];
		msg.getConnAckMsg(item.socket.remoteAddress, item.listeningPort);
	}
	return msg.getConnAckMsg();
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

connection.disconnect = disconnect;

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
			data.socket.write(JSON.stringify(msg.getGreetingMsg(port)));
			routingTable.push({socket: data.socket, listeningPort: data.socket.remotePort});
		break;
		case msg.ROUTE_LIST:
			eventEmitter.addRoutes(data.routes);
			eventEmitter.addVisited(data.socket.remoteAddress,data.socket.remotePort);
			debugger;
			data.socket.end();
			eventEmitter.emit('reconnect');
		break;
	}
}

connection.processMessage = processMessage;

exports.start = function() {

	server = net.createServer( function(socket) {
		var message = requestConnection(socket);
		
		socket.write(JSON.stringify(message));
		
		socket.on('data', function(data) {
			console.log(data.toString());
			data = JSON.parse(data.toString());
			data.socket = this;
			processMessage(data);
		});
		
		// Rozłączenie
		socket.on('error', function() {
			disconnect(socket);
		});
		
	});

	server.on('listening',function() {
		console.log('Listening on '+host+':'+port);
		startClient();
	});

	server.on('error', function(e) {
		if (e.code == 'EADDRINUSE') {
			console.log('Address in use, retrying...\x1b[0m');
			port++;
			setTimeout(function () {
			  server.listen(port);
			}, 100);
		}
	});

	server.listen(port);
}

function startClient() {
	if (cli.connect)
	{
		client.connect(cli.connectPort,cli.connectAddr, function(port,address) {
			console.log("Connected to "+address+':'+port);
		});
	}
}