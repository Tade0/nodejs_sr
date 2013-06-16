//Fisher–Yates shuffle
Array.prototype.shuffle = function () {
  var i = this.length, j, temp;
  if ( i === 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j]; 
     this[j] = temp;
   }
}

Array.prototype.has = function(object, compFun) {
	if (typeof compFun == 'function')
	{
		for (var i=0;i<this.length;i++)
		{
			if (compFun(this[i],object)) return i;
		}
	}
	else
	{
		for (var i=0;i<this.length;i++)
		{
			if (object.equals(this[i])) return i;
		}
	}
	return -1;
}

function equals(to) {
	if (!to) return false;
	if (this.length != to.length)
	{
		return false;
	}
	for (var i=0;i<this.length;i++)
	{
		if (this[i] != to[i])
		{
			return false;
		}
	}
	return true;
}

Buffer.prototype.equals = equals;
Array.prototype.equals = equals;

exports.randomBuffer = function(size) {
	var result = new Buffer(size);
	for (var i=0;i<size;i++)
	{
		result[i] = Math.floor(Math.random()*256);
	}
	return result;
}