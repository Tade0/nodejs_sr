var events = require('events');
var messages = require('./messages.js');

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

exports.eventManager.on('reconnect', function() {
	if (this.table.length > 0)
	{
		var row = this.table.shift();
		
		var visited = this.visited;
		for (var i=visited.length-1;i>=0;i--)
		{
			if (visited[i].address == row.address && visited[i].port == row.port)
			{
				console.log('already visited '+visited[i].address+':'+visited[i].port);
				this.emit('reconnect');
				return;
			}
		}
		
		console.log('reconnecting: '+row.address+':'+row.port);
		client.connect(row.port,row.address, function(port,address) { console.log('\x1b[32mConnected to '+address+':'+port+'\x1b[0m'); } );
	}
});

exports.eventManager.on('payload', function(data) {
	if (name.equals(data.payload.to))
	{
		var visited = [];
		data.visited.forEach( function(item) {
			visited.push(new Buffer(item));
		});
		var msg = messages.getBroadcastMsg({s: "Replied to you", who: name}, visited, true);
		exports.processMessage(msg);
	}
});
exports.eventManager.on('reply', function(data) {
	console.log(data.payload.who+" replied with "+data.payload.s);
});