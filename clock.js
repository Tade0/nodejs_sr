exports.OK = 0;
exports.FUTURE = 1;
exports.PAST = 2;


exports.Clock = function() {
	var vector = {};
	this.tick = function(name, time) {
		if (Array.isArray(name))
		{
			name = new Buffer(name);
		}
		name = name.toString('base64');
		if (typeof vector[name] == "undefined")
		{
			vector[name] = time;
		}
		else
		{
			if (vector[name] == time-1)
			{
				vector[name] = time;
				return {type: exports.OK, time: vector[name]};
			}
			else
			{
				if (vector[name] < time-1)
				{
					return {type: exports.FUTURE, time: vector[name]};
				}
				else
				{
					return {type: exports.PAST, time: vector[name]};
				}
			}
		}
	}
	this.getTime = function(name) {
		if (Array.isArray(name))
		{
			name = new Buffer(name);
		}
		return vector[name.toString('base64')];
	}
}