maxRoutes = 3;
routingTable = [];

var net = require('net');
var msg = require('./messages.js');
var cli = require('./cli.js');
var helper = require('./helper.js');
var event = require('./event.js');
var connection = require('./connection.js');
var monitor = require('./monitor/monitor.js');


name = typeof cli.name == "undefined" ? helper.randomBuffer(2) : new Buffer(JSON.parse(cli.name));

console.log('My name is: '+JSON.stringify(name));

var host = '127.0.0.1';
var port = cli.portNum;


eventEmitter = event.eventManager;
client = connection.clientManager;
monitor.eventEmitter = eventEmitter;
monitor.init();

function requestConnection(socket) {
	if (routingTable.length >= maxRoutes) {
		return msg.getRouteList(routingTable);
	}
	routingTable.push({ socket: socket, listeningPort: 0 });
	eventEmitter.emit('routingTableChange');
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
		eventEmitter.emit('routingTableChange');
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
			eventEmitter.emit('routingTableChange');
		break;
		case msg.ROUTE_LIST:
			eventEmitter.addRoutes(data.routes);
			eventEmitter.addVisited(data.socket.remoteAddress,data.socket.remotePort);
			data.socket.end();
			eventEmitter.emit('reconnect');
		break;
		case msg.BROADCAST:
			if (data.visited.has(name) == -1)
			{
				eventEmitter.emit('payload',data);
				data.visited.push(name);
				routingTable.forEach( function(item) {
					if (data.visited.has(item.name) === -1)
					{
						item.socket.write(JSON.stringify(msg.getBroadcastMsg(data.payload, data.visited,false,data.id)));
					}
				});
			}
		break;
		case msg.REPLY:
			var names = routingTable.map( function(item) {
				return item.name;
			});
			if (data.visited.length == 0)
			{
				eventEmitter.emit('reply',data);
				break;
			}
			var lastName = data.visited.pop();
			var i = names.has(lastName);
			if (i != -1)
			{
				routingTable[i].socket.write(JSON.stringify(msg.getBroadcastMsg(data.payload, data.visited,true,data.id)));
			}
			else
			{
				//TODO: A co jeżeli topologia sieci zdążyła się zmienić?
				/*else
				{
					for(var i=0;i<data.visited.length;i++)
					{
						
					}
				}*/
			}
		break;
	}
}

connection.processMessage = processMessage;
event.processMessage = processMessage;

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
		setTimeout( function() { console.log('testing Broadcast'); processMessage(msg.getBroadcastMsg({s:"Trolololo",to: [[0,0]]},[]));}, 1500);
	}
}