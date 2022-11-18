//server to emulate the musiccast responses
const http = require('http');
const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk');

const path = require('path');

console.log('PATH ist ' + path.join(__dirname, './data/'));

let server;
let deviceanswer = [];

class YamahaYXCEmu {
	constructor(testfile, testdevice, port, debugmode) {
		this.testfile = testfile;
		this.testdevice = testdevice;
		this.emuport = port;
		this.debugmode = debugmode;
		this.deviceresponse = null;
	}

	loadYXCResponse(file, device) {
		const YXCresponses = fs.readFileSync(path.join(__dirname, './data/') + file);
		const deviceresp = JSON.parse(YXCresponses)[device];
		this.deviceresponse = deviceresp;
		deviceanswer = deviceresp; //the global variable workaround
	}

	setupHttpServer(callback) {
		console.log(
			chalk.yellow(
				figlet.textSync('MC YXC Emulation', {
					font: 'Standard',
					horizontalLayout: 'default',
					verticalLayout: 'default',
					width: 80,
					whitespaceBreak: true
				})
			)
		);
		this.loadYXCResponse(this.testfile, this.testdevice);
		console.log('loaded Emulation: ' + this.deviceresponse['system']['getDeviceInfo']['model_name']);
		console.log();
		//We need a function which handles requests and send response
		//Create a server
		server = http.createServer(this.handleHttpRequest);
		//Lets start our server
		server.listen(this.emuport, function() {
			//Callback triggered when server is successfully listening. Hurray!
			console.log('Musiccast Emulation listening on: http://localhost:%s', 3311);
			console.log();
			console.log('---------------------------------------------');
			callback();
		});
	}

	//Antworten des MusicCast Gerätes
	handleHttpRequest(request, answer) {
		console.log('HTTP-Server: Request: ' + request.method + ' ' + request.url);
		const req = request.url.replace('/YamahaExtendedControl/v1', '');
		if (this.debugmode) console.log(req);
		const path = req.split('/');
		if (this.debugmode) console.log(path);
		//path1 ist der Einstiegsknoten system oder netusb
		//path2 ist die eigentliche Anfrage
		//wenn path2 set enthält dann ist es ein CMD und payload muß ausgewertet werden

		// How to get here access to this.deviceresponse??
		// using a variable ozside of the class !
		if (deviceanswer.hasOwnProperty(path[1])) {
			if (deviceanswer[path[1]].hasOwnProperty(path[2])) {
				if (path[2].includes('set')) {
					// payload =
					// check plausibility
					// modify object
					answer.writeHead(200, { 'Content-Type': 'application/json' });
					answer.write(JSON.stringify({ response_code: 0 }));
					answer.end();
					console.log('-> command success');
				} else {
					answer.writeHead(200, { 'Content-Type': 'application/json' });
					answer.write(JSON.stringify(deviceanswer[path[1]][path[2]]));
					answer.end();
					console.log('-> answered request');
				}
				//dann gibt es noch start/stop/recall
			} else {
				answer.writeHead(200, { 'Content-Type': 'application/json' });
				answer.write(JSON.stringify({ response_code: 3 }));
				answer.end();
				console.log('-> not answered, request not in object');
			}
		} else {
			answer.writeHead(200, { 'Content-Type': 'application/json' });
			answer.write(JSON.stringify({ response_code: 3 }));
			answer.end();
			console.log('-> not answered, entrypoint not in object');
		}
	}
}
module.exports = YamahaYXCEmu;
