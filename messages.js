exports.HELLO = "hello";
exports.HI = "hi";
exports.ROUTE_LIST = "routeList";
exports.BROADCAST = "broadcast";

// Komponuje wiadomosc na podstawie podanej tablicy routingu
exports.getRouteList = function(routingTable) {
	var routingMessage = {type: exports.ROUTE_LIST, routes: []};
	routingTable.forEach( function(record) {
		if (record.listeningPort != 0)
		{
			routingMessage.routes.push({ "address": record.socket.remoteAddress, "port": record.listeningPort });
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

exports.getBroadcastMsg = function(payload, visited, id) {
	if (typeof id == 'undefined')
	{
		id = Math.floor(Math.random()*Math.pow(2,31));
	}
	return {type: exports.BROADCAST, payload: payload, visited: visited, id: id };
}

exports.getGreetingMsg = function(port) {
	return {type: exports.HI, port: port, name: name};
}
//exports.myPortMsg = {type: ""};