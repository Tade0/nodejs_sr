var net = require('net');
var events = require('events');
var msg = require('./messages.js');

exports.ClientManager = function(maxConnections) {
	
	this.connect = function(port,address)
	{
		var socket = new net.Socket();
		
		socket.on('data', function(data) {
			debugger;
			console.log(this.remoteAddress+" "+this.remotePort);
			console.log(data.toString());
			data = JSON.parse(data.toString());
			data.socket = this;
			exports.processMessage(data);
		});
		
		socket.on('error', function(e) {
			console.log(e.code);
			exports.disconnect(this);
		});
		
		socket.on('end', function() {
			exports.disconnect(this);
		});
		
		socket.connect(port,address, function() {
			routingTable.push({socket: this, listeningPort: this.remotePort});
		});
	}
}

//Singleton
exports.clientManager = new exports.ClientManager(1);