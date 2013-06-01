var net = require('net');
var events = require('events');
var msg = require('./messages.js');

exports.ClientManager = function(maxConnections) {
	
	this.connect = function(port,address,callback)
	{
		var socket = new net.Socket();
		
		socket.on('data', function(data) {
			console.log('\x1b[37;1mdata from: '+this.remoteAddress+':'+this.remotePort+' \x1b[0m'+data.toString());
			data = JSON.parse(data.toString());
			data.socket = this;
			exports.processMessage(data);
		});
		
		socket.on('error', function(e) {
			console.log(e.code);
			exports.disconnect(this);
		});
		
		socket.on('end', function() {
			console.log('\x1b[31mdisconnecting from '+this.remoteAddress_+':'+this.remotePort_+'\x1b[0m');
			exports.disconnect(this);
		});
		
		socket.connect(port,address, function() {
			if (typeof callback == "function")
			{
				callback(this.remotePort,this.remoteAddress);
				this.remotePort_ = this.remotePort;
				this.remoteAddress_ = this.remoteAddress;
			}
		});
	}
}

//Singleton
exports.clientManager = new exports.ClientManager(maxRoutes);