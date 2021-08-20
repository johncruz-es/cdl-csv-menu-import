'use strict';
const express =   require('express');
const http =	require('http');
const portnum = 9000;
const app = 	express();
const rtools = require('./route-tools');
const multer = require('multer');
const csvp = require('./csv-processor');

// Initialize Express
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: true, limit: '10mb' }));

app.set('port', portnum);
app.post(
	'/v1/menu/canteen/convert', 
	multer().single('file'), 
	rtools.DisplayRouteData,
	csvp.ProcessCSV, 
	rtools.DisplayReturnData,
	(req, res) => {
		res.send(res.locals.data);
	}
);
app.post(
	'*', 
	rtools.DisplayRouteData, 
	(req, res) => {
		res.statusCode = 404;
		res.send("This is not the route you are looking for");
	}
);

app.get('*', rtools.DisplayRouteData, (req, res) => {
	res.statusCode = 404;
	res.send("This is not the route you are looking for");
	},
	rtools.DisplayReturnData
);

app.use(rtools.HandleError);

// app.disable('x-powered-by');

http.createServer(app).listen(portnum);	
console.log(`CDL CSV Menu conversion is listening on port ${portnum}`);