var config = require('./connection_config');

var conn_str = config.conn_str;

var sql = require('msnodesql');
var express = require('express');
var dateFormat = require('dateformat');

var app = express();
var port = process.env.PORT || 3000;

app.get('/cnxtest', function(req, res) {

        sql.open(conn_str, function (err, conn) {
        
        if (err) {
            console.log('Error opening the connection!'+err);
            return;
        }
        else {
            res.send('CONNEXION OK');
            //console.log('CONNEXION OK');
        }

    });
});

app.get('/Semelle', function(req, res) {

        sql.open(conn_str, function (err, conn) {
        
        if (err) {
            console.log('Error opening the connection!'+err);
            return;
        }

        var requ = 'SELECT ID, Date, IdRame, IdSite, IdIntervention, Controler, Data FROM T_DataSemelle  ORDER BY ID DESC';
        
        conn.queryRaw(requ , function (err, ctrls) {

        console.log('CONNEXION OK');

        if (err) {
            console.log('Error running query!');
            console.log(err);
            return;
        }

        for (var i = 0; i < ctrls.rows.length; i++) {  

        ctrls.rows[i][6] = ctrls.rows[i][6].toString();
        ctrls.rows[i][6] = ctrls.rows[i][6].replace(/\u0000/g, "");
        ctrls.rows[i][6] = JSON.parse(ctrls.rows[i][6]);
        ctrls.rows[i][1] = dateFormat(ctrls.rows[i][1],"dd/mm/yyyy")
        if (i == ctrls.rows.length - 1) { retour(); }

        };

        function retour() {

        res.setHeader('Access-Control-Allow-Origin' , '*'); //--- important
        res.setHeader('Access-Control-Allow-Methods' , ['OPTIONS', 'GET', 'POST']);
        res.type('json');
        res.jsonp(200,ctrls.rows);
        };

        }); 

    });
});

app.get('/SemelleEdit', function(req, res) {

        sql.open(conn_str, function (err, conn) {
        
        if (err) {
            console.log('Error opening the connection!'+err);
            return;
        }

        var requ = 'SELECT ID, Date, IdSerie, IdRame, IdSite, IdIntervention, Controler, Data FROM T_DataSemelle WHERE ID='+req.query.ctrlId;

        conn.queryRaw(requ , function (err, ctrls) {

        console.log('CONNEXION OK');

        if (err) {
            console.log('Error running query!');
            console.log(err);
            return;
        }

        ctrls.rows[0][7] = ctrls.rows[0][7].toString();
        ctrls.rows[0][7] = ctrls.rows[0][7].replace(/\u0000/g, "");
        ctrls.rows[0][7] = JSON.parse(ctrls.rows[0][7]);
        ctrls.rows[0][1] = dateFormat(ctrls.rows[0][1],"dd/mm/yyyy")

        res.setHeader('Access-Control-Allow-Origin' , '*'); //--- important
        res.setHeader('Access-Control-Allow-Methods' , ['OPTIONS', 'GET', 'POST']);
        res.type('json');
        res.jsonp(200,ctrls.rows[0]);

        }); 
    });
});


app.listen(port);
console.log('App listening on port '+ port);