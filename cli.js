args = process.argv.slice(2);
exports.port = false;
exports.portNum = 8080;

exports.connect = false;
exports.connectAddr = '0.0.0.0';
exports.connectPort = 8080;

for (var i = 0;i <args.length; i++)
{
	if (args[i+1])
	{
		switch(args[i])
		{
			case 'port':
				exports.portNum = (args[i+1]+"").search("^\\d+&") != 1 ? args[i+1] : 8080;
				exports.port = (args[i+1]+"").search("^\\d+&") != 1 ? true : false ;
			break;
			case 'connect':
				exports.connectAddr = (args[i+1]+"").search("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$") != 1 ? args[i+1] : '0.0.0.0';
				exports.connectPort = (args[i+2]+"").search("^\\d+&") != 1 ? args[i+2] : 8080;
				exports.connect = true;
			break;
		}
	}
}