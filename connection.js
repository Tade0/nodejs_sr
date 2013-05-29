var net = require('net');
var events = require('events');

exports.ClientSocket = function () {
	net.Socket.call(this);
	this.on('data', function(data) {
		console.log(data.toString());
		data = JSON.parse(data.toString());
		exports.processMessage(data);
	});
	this.on('error', function(e) {
		console.log(e.code);
		clientManager.freeSocket(this);
		eventEmitter.emit('reconnect');
	});
	this.on('end', function() {
		clientManager.freeSocket(this);
		eventEmitter.emit('reconnect');
	});
};

exports.ClientSocket.prototype = new net.Socket();
exports.ClientSocket.prototype.constructor = exports.ClientSocket;

exports.ClientManager = function(maxConnections) {
	var freeSockets = new Array(maxConnections);
	var occupiedSockets = [];
	
	for (var i = 0;i<maxConnections;i++)
	{
		freeSockets[i] = new exports.ClientSocket();
	}
	
	this.connect = function(port,address)
	{
		if (freeSockets.length > 0)
		{
			var socket = freeSockets[Math.floor(Math.random()*freeSockets.length)];
			socket.connect(port,address, function() {
				occupySocket(socket); 
			});
		}
		else
		{
			console.log('No free sockets.');
		}
	}
	
	this.occupySocket = function(socket) {
		occupiedSockets.push(freeSockets.splice(freeSockets.indexOf(socket),1));
	}
	
	this.freeSocket = function(socket) {
		freeSockets.push(occupiedSockets.splice(occupiedSockets.indexOf(socket),1));
	}
}

//Singleton
exports.clientManager = new ClientManager();