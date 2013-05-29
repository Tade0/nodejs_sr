var net = require('net');
var msg = require('./messages.js');
var cli = require('./cli.js');
var helper = require('./helper.js');
var mng = require('./managers.js');
var events = require('events');

var host = '127.0.0.1';
var port = cli.portNum;
var routingTable = [];
var maxRoutes = 2;

var ClientSocket = function () {
	net.Socket.call(this);
	this.on('data', function(data) {
		console.log(data.toString());
		data = JSON.parse(data.toString());
		processMessage(data);
	});
	this.on('error', function(e) {
		console.log(e.code);
		eventEmitter.emit('reconnect');
	});
	this.on('end', function() {
		eventEmitter.emit('reconnect');
	});
};

ClientSocket.prototype = new net.Socket();
ClientSocket.prototype.constructor = ClientSocket;

var eventEmitter = new mng.EventManager();
var client = new ClientSocket();

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
			eventEmitter.addRoutes(data.routes);
			eventEmitter.emit('routing');
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
		startClient();
	});

	server.on('error', function(e) {
		if (e.code == 'EADDRINUSE') {
			console.log('Address in use, retrying...');
			port++;
			setTimeout(function () {
			  server.listen(port);
			}, 200);
		}
	});

	server.listen(port);
}

function startClient() {
	if (cli.connect)
	{
		client.connect(cli.connectPort,cli.connectAddr, function() {
			console.log("Connected");
		});
	}
}

eventEmitter.on('routing', function() {
	if (this.table.length > 0)
	{
		console.log('routing');
		client.end();
	}
	else
	{
		console.log('routing table empty');
	}
});

eventEmitter.on('reconnect', function() {
	if (this.table.length > 0)
	{
		var row = this.table.pop();
		console.log(row.address+':'+row.port);
		client.connect(row.port,row.address);
	}
});