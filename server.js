maxRoutes = 4;
routingTable = [];

var net = require('net');
var msg = require('./messages.js');
var cli = require('./cli.js');
var helper = require('./helper.js');
var event = require('./event.js');
var connection = require('./connection.js');
var monitor = require('./monitor/monitor.js');
var chatClient = require('./client.js');
var vectorTime = require('./clock.js');


name = typeof cli.name == "undefined" ? helper.randomBuffer(2) : new Buffer(JSON.parse(cli.name));

console.log('My name is: '+JSON.stringify(name));

var host = '127.0.0.1';
var port = cli.portNum;


eventEmitter = event.eventManager;
client = connection.clientManager;
connection.eventEmitter = eventEmitter;
monitor.eventEmitter = eventEmitter;
chatClient.eventEmitter = eventEmitter;
monitor.init();
chatClient.init();

clock = new vectorTime.Clock();
chatClient.clock = clock;
event.clock = clock;
clock.tick(name,0);

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

eventEmitter.on('processMessage', function(data) {
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
		case msg.NOTE:
			eventEmitter.emit('payload',data);
		break;
	}
});

eventEmitter.on('disconnect', function() {
	eventEmitter.clear();
	eventEmitter.addVisited("",0,name);
	routingTable.forEach( function(item) {
		eventEmitter.addVisited("",0,item.name);
	});
});

eventEmitter.on('redundancy', function(routes) {
	if (typeof routes == "undefined")
	{
		eventEmitter.clear();
		eventEmitter.addVisited("",0,name);
		routingTable.forEach( function(item) {
			eventEmitter.addVisited("",0,item.name);
			item.socket.write( JSON.stringify( msg.getNoteMsg( {type: msg.ROUTE_LIST, to: []} ) ) );
		});
	}
	else
	{
		eventEmitter.addRoutes(routes);
		eventEmitter.emit('reconnect');
	}
	
});

eventEmitter.on('routingTableChange', function(routes) {
	if (routingTable.length <= 1)
	{
		eventEmitter.emit('redundancy');
	}
	
});

exports.start = function() {

	server = net.createServer( function(socket) {
		var message = requestConnection(socket);
		
		socket.write(JSON.stringify(message));
		
		socket.on('data', function(data) {
			console.log('\x1b[37;1mdata from: '+this.remoteAddress+':'+this.remotePort+' \x1b[0m'+data.toString());
			var dataText = data.toString();
			var json,data;
			if ( dataText.search("}{") > -1 )
			{
				while ( ( frameBreak = dataText.search("}{") ) > -1 )
				{
					json = dataText.substr(0,frameBreak+1);
					dataText = dataText.substr(frameBreak+1);
					data = JSON.parse(json);
					data.socket = this;
					eventEmitter.emit('processMessage',data);
				}
			}
			data = JSON.parse(dataText);
			data.socket = this;
			eventEmitter.emit('processMessage',data);
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
		setTimeout( function() { console.log('testing Broadcast'); eventEmitter.emit('processMessage',msg.getBroadcastMsg({s:"Trolololo",to: []},[])); }, 1500);
	}
}