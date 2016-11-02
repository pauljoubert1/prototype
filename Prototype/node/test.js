var express = require('express');

var app = express();

var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
	
	res.send('HELLO !!!');
	    //console.log('Cnx OoK !!');
});

app.listen(port);

console.log('App listening on port '+ port);