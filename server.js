maxRoutes = 3;
routingTable = [];

var net = require('net');
var msg = require('./messages.js');
var cli = require('./cli.js');
var helper = require('./helper.js');
var event = require('./event.js');
var connection = require('./connection.js');

name = helper.randomBuffer(2);

console.log('My name is: '+JSON.stringify(name));

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
					record.name = data.name;
				}
			});
		break;
		case msg.HELLO:
			data.socket.write(JSON.stringify(msg.getGreetingMsg(port)));
			routingTable.push({socket: data.socket, listeningPort: data.socket.remotePort, name: data.name});
		break;
		case msg.ROUTE_LIST:
			eventEmitter.addRoutes(data.routes);
			eventEmitter.addVisited(data.socket.remoteAddress,data.socket.remotePort);
			data.socket.end();
			eventEmitter.emit('reconnect');
		break;
		case msg.BROADCAST:
			if (!data.visited.has(name))
			{
				debugger;
				eventEmitter.emit('payload',data.payload);
				data.visited.push(name);
				routingTable.forEach( function(item) {
					debugger;
					if (!data.visited.has(item.name))
					{
						item.socket.write(JSON.stringify(msg.getBroadcastMsg(data.payload, data.visited,data.id)));
					}
				});
			}
		break;
	}
}

connection.processMessage = processMessage;

exports.start = function() {

	server = net.createServer( function(socket) {
		var message = requestConnection(socket);
		
		socket.write(JSON.stringify(message));
		
		socket.on('data', function(data) {
			console.log('\x1b[37;1mdata from: '+this.remoteAddress+':'+this.remotePort+' \x1b[0m'+data.toString());
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
			console.log('\x1b[33;1mAddress in use, retrying...\x1b[0m');
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
			console.log('\x1b[32mConnected to '+address+':'+port+'\x1b[0m');
		});
	}
	if (cli.testBroadcast) {
		setTimeout( function() { console.log('testing Broadcast'); processMessage(msg.getBroadcastMsg({s:"Trolololo"},[]));}, 2000);
	}
}