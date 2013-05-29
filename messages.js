exports.HELLO = "hello";
exports.HI = "hi";
exports.ROUTE_LIST = "routeList";

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
		return {type: exports.HELLO, address: address, port: port};
	}
	else
	{
		return {type: exports.HELLO}
	}
};

exports.getGreetingMsg = function(port) {
	return {type: exports.HI, port: port};
}
//exports.myPortMsg = {type: ""};