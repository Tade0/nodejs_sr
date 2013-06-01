var events = require('events');

exports.EventManager = function() {
	events.EventEmitter.call(this);
	this.table = [];
	this.visited = [];
	this.addRoutes = function(routes) {
		var temp = [];
		temp = this.table.concat(routes);
		this.table = temp;
	};
	this.addVisited = function(address,port) {
		this.visited.push({address: address, port: port});
	}
	
};

exports.EventManager.prototype = new events.EventEmitter;
exports.EventManager.prototype.constructor = exports.EventManager;

//Singleton
exports.eventManager = new exports.EventManager();

exports.eventManager.on('routing', function() {
	if (this.table.length > 0)
	{
		console.log('routing');
		this.emit('reconnect');
	}
	else
	{
		console.log('routing table empty');
	}
});

exports.eventManager.on('reconnect', function() {
	if (this.table.length > 0)
	{
		var row = this.table.shift();
		
		var visited = this.visited;
		for (var i=0;i<visited.length;i++)
		{
			if (visited[i].address == row.address && visited[i].port == row.port)
			{
				console.log('visited');
				this.emit('reconnect');
				return;
			}
		}
		
		console.log('reconnecting: '+row.address+':'+row.port);
		client.connect(row.port,row.address);
	}
});