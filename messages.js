// Komponuje wiadomosc na podstawie podanej tablicy routingu
exports.getRouteList = function(routingTable) {
	var routingMessage = {type: "route_list", routes: []};
	routingTable.forEach( function(record) {
		if (record.listeningPort != 0)
		{
			routingMessage.routes.push({ "address": record.socket.remoteAddress, "port": record.listeningPort });
		}
	});
	return routingMessage;
}
// Connection Acknowledgment Message
exports.connAckMsg = {type: "hello"};

exports.getGreetingMsg = function(port) {
	return {type: "hi", port: port};
}
//exports.myPortMsg = {type: ""};