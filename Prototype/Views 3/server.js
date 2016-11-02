// connexion a la BDD
console.log('server.js est actif');
var mysql = require('mysql');
var app = express();
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'webmat'
});




var SelectQuery = app.get('/index', function(req, res) {
	if (err) {
		console.log('Error opening the connection!'+err);
		return;
		
	}
	else {
		res.send('query récuperé');
		console.log('reussi');
        }
    });
//on se connecte a la BDD
connection.connect();
connection.query(SelectQuery, function(err, rows, fields) {
	if (err) throw err;
	console.log('The solution is: ', rows[0].solution);
	// var array = []
	return rows;
		//transformer en tableau en faisant boucler le row
	});

connection.end();
var TableSelect1 = switch()