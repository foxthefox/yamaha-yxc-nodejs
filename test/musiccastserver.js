//server to emulate the musiccast responses
const http = require('http');
const fs = require('fs');
const path = require('path');
console.log('PATH ist ' + path.join(__dirname, './data/'));

const YSP1600_v1_responses = fs.readFileSync(path.join(__dirname, './data/') + 'YSP1600_312_208.json');

let server;

let deviceresp = [];

function getObjects(Obj, where, what) {
	const foundObjects = [];
	for (const prop in Obj) {
		if (Obj[prop][where] == what) {
			foundObjects.push(Obj[prop]);
		}
	}
	return foundObjects;
}

function setupHttpServer(callback) {
	//We need a function which handles requests and send response
	//Create a server
	server = http.createServer(handleHttpRequest);
	//Lets start our server
	server.listen(3311, function() {
		//Callback triggered when server is successfully listening. Hurray!
		console.log('Musiccast listening on: http://localhost:%s', 3311);
		console.log('emulating: ' + deviceresp['system']['getDeviceInfo']['model_name']);
		callback();
	});
}

//Antworten des MusicCast Gerätes

deviceresp = JSON.parse(YSP1600_v1_responses)['YSP-1600'];

function handleHttpRequest(request, answer) {
	console.log('HTTP-Server: Request: ' + request.method + ' ' + request.url);

	const req = request.url.replace('/YamahaExtendedControl/v1', '');
	console.log(req);
	const path = req.split('/');
	console.log(path[1], path[2]);
	//wenn path2 set enthält dann ist es ein CMD
	if (deviceresp.hasOwnProperty(path[1])) {
		if (deviceresp[path[1]].hasOwnProperty(path[2])) {
			answer.writeHead(200, { 'Content-Type': 'application/json' });
			answer.write(JSON.stringify(deviceresp[path[1]][path[2]]));
			answer.end();
			console.log('answered');
		} else {
			answer.writeHead(200, { 'Content-Type': 'application/json' });
			answer.write(JSON.stringify({ response_code: 3 }));
			answer.end();
			console.log('not answered');
		}
	} else {
		answer.writeHead(200, { 'Content-Type': 'application/json' });
		answer.write(JSON.stringify({ response_code: 3 }));
		answer.end();
		console.log('not answered');
	}
}

//setupHttpServer(function() {});
module.exports.setupHttpServer = setupHttpServer;
