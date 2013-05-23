// Komponuje wiadomosc na podstawie podanej tablicy routingu
exports.getRouteList = function(routingTable) {
	var routingMessage = {type: "route_list", routes: []};
	routingTable.forEach( function(sock) {
		routingMessage.routes.push({ "address": sock.remoteAddress, "port": sock.remotePort });
	});
	return routingMessage;
}
// Connection Acknowledgment Message
exports.connAckMsg = {type: "hello"};
//exports.myPortMsg = {type: ""};

exports.parseMsg = function(message) {
	switch(message.type)
	{
		case '':
	}
}