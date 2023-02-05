//server to emulate the musiccast responses
const http = require('http');
const fs = require('fs');

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
		console.log('\x1b[33m', '  __  __           _       ____          _    __   ____  ______ ');
		console.log('\x1b[33m', ' |  \\/  |_   _ ___(_) ___ / ___|__ _ ___| |_  \\ \\ / /\\ \\/ / ___|');
		console.log('\x1b[33m', ' | |\\/| | | | / __| |/ __| |   / _` / __| __|  \\ V /  \\  / |    ');
		console.log('\x1b[33m', ' | |  | | |_| \\__ \\ | (__| |__| (_| \\__ \\ |_    | |   /  \\ |___ ');
		console.log('\x1b[33m', ' |_|  |_|\\__,_|___/_|\\___|\\____\\__,_|___/\\__|   |_|  /_/\\_\\____|');
		console.log('\x1b[32m', ' _____                  _       _   _     ');
		console.log('\x1b[32m', '| ____| _ __ ___  _   _| | __ _| |_(_) ___  _ __  ');
		console.log('\x1b[32m', '|  _|  | `_ ` _ \\| | | | |/ _` | __| |/ _ \\| `_ \\ ');
		console.log('\x1b[32m', '| |___ | | | | | | |_| | | (_| | |_| | (_) | | | |');
		console.log('\x1b[32m', '|_____||_| |_| |_|\\__,_|_|\\__,_|\\__|_|\\___/|_| |_|');
		console.log('\x1b[0m');

		this.loadYXCResponse(this.testfile, this.testdevice);
		console.log('loaded Emulation: ' + this.deviceresponse['system']['getDeviceInfo']['model_name']);
		console.log();
		//We need a function which handles requests and send response
		//Create a server
		server = http.createServer(this.handleHttpRequest);
		//Lets start our server
		server.listen(this.emuport, function() {
			//Callback triggered when server is successfully listening. Hurray!
			console.log('\x1b[34m', 'Musiccast Emulation listening on: http://localhost:', 3311);
			console.log('\x1b[0m');
			console.log('---------------------------------------------');
			callback();
		});
	}

	//Antworten des MusicCast Gerätes
	handleHttpRequest(request, answer) {
		console.log('HTTP-Server: Request: ' + request.method + ' ' + request.url);
		const req = request.url.replace('/YamahaExtendedControl/v1', '');
		if (this.debugmode) console.log('\x1b[36m', req);
		const path = req.split('/');
		if (this.debugmode) console.log('\x1b[36m', path);
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
					console.log('\x1b[32m', '-> command success');
				} else {
					answer.writeHead(200, { 'Content-Type': 'application/json' });
					answer.write(JSON.stringify(deviceanswer[path[1]][path[2]]));
					answer.end();
					console.log('\x1b[32m', '-> answered request');
				}
				//dann gibt es noch start/stop/recall
			} else {
				answer.writeHead(200, { 'Content-Type': 'application/json' });
				answer.write(JSON.stringify({ response_code: 3 }));
				answer.end();
				console.log('\x1b[31m', '-> not answered, request not in object');
			}
		} else {
			answer.writeHead(200, { 'Content-Type': 'application/json' });
			answer.write(JSON.stringify({ response_code: 3 }));
			answer.end();
			console.log('\x1b[31m', '-> not answered, entrypoint not in object');
		}
	}
}
module.exports = YamahaYXCEmu;
