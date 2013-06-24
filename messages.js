exports.HELLO = "hello";
exports.HI = "hi";
exports.ROUTE_LIST = "routeList";
exports.BROADCAST = "broadcast";
exports.REPLY = "reply";
exports.ROUTING_TABLE = "routingTable";
exports.NOTE = "note";

// Komponuje wiadomosc na podstawie podanej tablicy routingu
exports.getRouteList = function(routingTable) {
	var routingMessage = {type: exports.ROUTE_LIST, routes: []};
	routingTable.forEach( function(record) {
		if (record.listeningPort != 0)
		{
			routingMessage.routes.push({ "address": record.socket.remoteAddress, "port": record.listeningPort, "name": record.name });
		}
	});
	return routingMessage;
}
// Connection Acknowledgment Message
exports.getConnAckMsg = function(address,port) {
	if (typeof(address) != 'undefined' && typeof(port) != 'undefined')
	{
		return {type: exports.HELLO, address: address, port: port, name: name};
	}
	else
	{
		return {type: exports.HELLO, name: name}
	}
};

exports.getBroadcastMsg = function(payload, visited, reply, id ) {
	if (typeof id == 'undefined')
	{
		id = Math.floor(Math.random()*Math.pow(2,31));
	}
	if (typeof reply == 'undefined')
	{
		reply = false;
	}
	if (typeof visited == 'undefined')
	{
		visited = [];
	}
	return {type: reply ? exports.REPLY : exports.BROADCAST, payload: payload, visited: visited, id: id };
}

exports.getGreetingMsg = function(port) {
	return {type: exports.HI, port: port, name: name};
}

exports.getRoutingTableMsg = function(to) {
	if (typeof to == "undefined")
	{
		to = [];
	}
	return exports.getBroadcastMsg({type: exports.ROUTING_TABLE, to: to},[]);
}

exports.getNoteMsg = function(payload) {
	return {type: exports.NOTE, payload: payload, visited: [name]};
}