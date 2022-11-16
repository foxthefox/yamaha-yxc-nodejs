/**
 * The Yamaha YXC Module Constructor.
 * @constructor
 * @param {string} ip - The ip of the yamaha receiver.
 * @param {number} requestTimeout - timeout of request
 */

import request from '@root/request';
import simpleSSDP from 'simple-ssdp';
import http from 'http';

var reyxcControl = /<yamaha:X_yxcControlURL>*.YamahaExtendedControl.*<\/yamaha:X_yxcControlURL>/i; // instead query to MusicCast, because YSP soundbar is not returning MusicCast! it is "TV Peripheral"
// var reYamahaModelDesc = /<modelDescription>*.MusicCast.*<\/modelDescription>/i;
var reFriendlyName = /<friendlyName>([^<]*)<\/friendlyName>/;
var reModelName = /<modelName>([^<]*)<\/modelName>/i;
var reUniqueID = /<serialNumber>([^<]*)<\/serialNumber>/i; //same as getDeviceInfo:system_id
var reDevId = /<UDN>uuid:([^-]+-){4}([^<]*)<\/UDN>/i; //same as getDeviceInfo:system_id

class YamahaYXC {
	constructor(ip, requestTimeout) {
		//for testing
		let ipparts = [];
		if (ip) {
			ipparts = ip.split(':');
		}
		this.ip = null || ipparts[0];
		this.port = null || ipparts[1];
		this.requestTimeout = requestTimeout;
		this.catchRequestErrors = true;
	}

	//-------------- general Communication ---------------------------
	async SendReqToDevice(cmd, method, body) {
		let ip = this.ip;
		if (this.port) ip = ip + ':' + this.port;
		const req = {
			method,
			body,
			uri: 'http://' + ip + '/YamahaExtendedControl/v1' + cmd,
			headers: {
				'X-AppName': 'MusicCast/1.0',
				'X-AppPort': '41100'
			}
		};
		if (this.requestTimeout) req.timeout = this.requestTimeout;
		try {
			const resp = await request(req);
			if (resp.headers['content-type'] === 'application/json') {
				return Promise.resolve(JSON.parse(resp.body));
			} else {
				return Promise.resolve(resp.body);
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async SendGetToDevice(cmd) {
		return await this.SendReqToDevice(cmd, 'GET');
	}
	async SendPostToDevice(cmd, data) {
		return await this.SendReqToDevice(cmd, 'POST', data);
	}

	//------ DISCOVERY FUNCTIONS
	async discoverSSDP(timeout) {
		let p = new Promise(async function(resolve, reject) {
			let devices = [];
			// Create and configure simpleSSDP object
			const ssdp = new simpleSSDP({
				device_name: 'MusicCast NodeJS Interface',
				port: 8000,
				location: '/xml/description.xml',
				product: 'Musiccast',
				product_version: '2.0'
			});
			// Start
			ssdp.start();
			// Event: service discovered
			ssdp.on('discover', (data) => {
				if (data['st'] == 'urn:schemas-upnp-org:device:MediaRenderer:1') {
					//console.log('got data', data['address']);
					var isFound = false;
					if (devices.length == 0) devices.push(data);
					for (let i = 0; i < devices.length; i++) {
						if (devices[i].address === data.address) {
							isFound = true;
							break;
						}
					}
					if (!isFound) {
						devices.push(data);
					}
				}
			});
			// Event: error
			ssdp.on('error', (err) => {
				console.log(err);
				reject('error in ssdp', e);
				return;
			});
			// Discover all services on the local network
			ssdp.discover();
			// Stop after 6 seconds
			await new Promise((cb) => setTimeout(cb, timeout || 5000));
			// console.table(devices);
			ssdp.stop(() => {
				console.log('SSDP stopped');
			});
			resolve(devices);
		});
		return await p;
	}

	async getXML(ssdpheader) {
		const urladdr = new URL(ssdpheader);
		const options = {
			hostname: urladdr.hostname,
			port: urladdr.port,
			path: urladdr.pathname,
			method: 'GET'
		};
		let p = new Promise((resolve, reject) => {
			const req = http.request(options, (res) => {
				res.setEncoding('utf8');
				if (res.statusCode !== 200) {
					throw Error(`HTTP request Failed. Status Code: ${res.statusCode}`);
				}
				// cumulate data
				let responseBody = ''; // let body = []
				res.on('data', (chunk) => {
					responseBody += chunk; //body.push(chunk)
				});
				// resolve on end
				res.on('end', () => {
					try {
						reyxcControl.test(responseBody);
					} catch (error) {
						reject(error);
					}
					var model = reModelName.exec(responseBody);
					var name = reFriendlyName.exec(responseBody);
					var sysid = reUniqueID.exec(responseBody);
					var devid = reDevId.exec(responseBody);
					resolve([ name[1], model[1], sysid[1], String(devid[2]).toUpperCase() ]);
				});
			});
			// reject on request error
			req.on('error', (err) => {
				// This is not a "Second reject", just a different sort of failure
				reject(err);
			});
			//always necessary
			req.end();
		});
		return await p;
	}

	//new function returning an array of all found devices
	async discover(timeout) {
		try {
			const foundDevices = await this.discoverSSDP(timeout);
			let musicdevices = [];
			try {
				await Promise.all(
					foundDevices.map(async (device) => {
						const deviceinfo = await this.getXML(device.location);
						musicdevices.push({
							ip: device.address,
							model: deviceinfo[0],
							name: deviceinfo[1],
							systemId: deviceinfo[2],
							deviceId: deviceinfo[3]
						});
					})
				);
				return Promise.resolve(musicdevices);
			} catch (error) {
				return Promise.reject(error);
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	//-------------Zone related comands----------
	async power(on, zone) {
		try {
			const command =
				'/' +
				this.getZone(zone) +
				'/setPower?power=' +
				(on === 'on' || on === true || on === 'true' ? 'on' : 'standby');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async powerOn(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setPower?power=on';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async powerOff(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setPower?power=standby';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async sleep(val, zone) {
		if (val < 30) val = '0';
		else if (val < 60) val = '30';
		else if (val < 90) val = '60';
		else if (val < 120) val = '90';
		else val = '120';
		try {
			const command = '/' + this.getZone(zone) + '/setSleep?sleep=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setVolumeTo(to, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setVolume?volume=' + to;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async mute(on, zone) {
		try {
			const command =
				'/' + this.getZone(zone) + '/setMute?enable=' + (on === 'true' || on === true ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async muteOn(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setMute?enable=true';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async muteOff(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setMute?enable=false';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setInput(input, zone, mode) {
		if (mode == null || mode == 'undefined') {
			mode = '';
		} else {
			mode = '&mode=' + mode;
		}
		//check for correct input in calling program
		try {
			const command = '/' + this.getZone(zone) + '/setInput?input=' + input + mode;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setSound(input, zone) {
		//check for correct input in calling program
		try {
			const command = '/' + this.getZone(zone) + '/setSoundProgram?program=' + input;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async surround(on, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/set3dSurround?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async surroundOn(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/set3dSurround?enable=true';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async surroundOff(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/set3dSurround?enable=false';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setDirect(on, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setDirect?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setPureDirect(on, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setPureDirect?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setEnhancer(on, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setEnhancer?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setClearVoice(on, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setClearVoice?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setBassTo(val, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setToneControl?mode=manual&bass=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setTrebleTo(val, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setToneControl?mode=manual&treble=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setEqualizer(low, mid, high, zone) {
		try {
			const command =
				'/' + this.getZone(zone) + '/setEqualizer?mode=manual&low=' + low + '&mid=' + mid + '&high=' + high;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setBalance(val, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setBalance?value=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setSubwooferVolumeTo(val, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setSubwooferVolume?volume=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setBassExtension(on, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setBassExtension?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//get commands
	async getSignalInfo(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/getSignalInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getStatus(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/getStatus';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getSoundProgramList(zone) {
		try {
			const command = '/' + this.getZone(zone) + '/getSoundProgramList';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//------------ NetUSB commands --------------
	async getPresetInfo() {
		try {
			const command = '/netusb/getPresetInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getSettings() {
		try {
			const command = '/netusb/getSettings';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getRecentInfo() {
		try {
			const command = '/netusb/getRecentInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async clearRecentInfo() {
		try {
			const command = '/netusb/clearRecentInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setNetPlayback(val) {
		if (!val || val == 'play') val = 'play';
		else if (val == 'stop') val = 'stop';
		else if (val == 'pause') val = 'pause';
		else if (val == 'play_pause') val = 'play_pause';
		else if (val == 'previous') val = 'previous';
		else if (val == 'next') val = 'next';
		else if (val == 'frw_start') val = 'fast_reverse_start';
		else if (val == 'frw_end') val = 'fast_reverse_end';
		else if (val == 'ffw_start') val = 'fast_forward_start';
		else if (val == 'ffw_end') val = 'fast_forward_end';
		try {
			const command = '/netusb/setPlayback?playback=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async toggleNetRepeat() {
		try {
			const command = '/netusb/toggleRepeat';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async toggleNetShuffle() {
		try {
			const command = '/netusb/toggleShuffle';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async storePreset(val) {
		if (!val) throw new Error('preset val must be specified');
		try {
			const command = '/netusb/storePreset?num=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async clearPreset(val) {
		if (!val) throw new Error('preset val must be specified');
		try {
			const command = '/netusb/clearPreset?num=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async recallPreset(val, zone) {
		if (!val) val = '1';
		try {
			const command = '/netusb/recallPreset?zone=' + this.getZone(zone) + '&num=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async recallRecentItem(val, zone) {
		if (!val) val = '1';
		try {
			const command = '/netusb/recallRecentItem?zone=' + this.getZone(zone) + '&num=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async stopNet() {
		try {
			const command = '/netusb/setPlayback?playback=stop';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async pauseNet() {
		try {
			const command = '/netusb/setPlayback?playback=pause';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async playNet() {
		try {
			const command = '/netusb/setPlayback?playback=play';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async nextNet() {
		try {
			const command = '/netusb/setPlayback?playback=next';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async prevNet() {
		try {
			const command = '/netusb/setPlayback?playback=previous';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async frwNet(state) {
		try {
			let on;
			if (state === '1' || state === true || state === 1 || state === 'true') {
				on = 1;
			} else {
				on = 0;
			}
			const command = '/netusb/setDirect?playback=' + (on ? 'fast_reverse_start' : 'fast_reverse_end');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async ffwNet(state) {
		let on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/netusb/setDirect?playback=' + (on ? 'fast_forward_start' : 'fast_forward_end');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//----------- NETUSB list info -------------
	async getListInfo(input, index, size, lang) {
		if (size == null || size == 'undefined') {
			size = '8';
		}
		if (lang == null || lang == 'undefined') {
			lang = '';
		} else {
			lang = '&lang=' + lang;
		}
		try {
			const command = '/netusb/getListInfo?input=' + input + '&index=' + index + '&size=' + size + lang;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setListControl(listId, type, index, zone) {
		if (index == null || index == 'undefined') {
			index = '';
		} else {
			index = '&index=' + index;
		}
		if (zone == null || zone == 'undefined') {
			zone = '';
		} else {
			zone = '&zone=' + zone;
		}
		try {
			const command = '/netusb/setListControl?list_id=' + listId + '&type=' + type + index + zone;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//-----------  NETUSB musiccast playlists ------------
	async getMCPlaylists() {
		try {
			const command = '/netusb/getMcPlaylistName';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getMCPlaylistContent(bank, index) {
		try {
			const command = '/netusb/getMcPlaylist?bank=' + bank + '&index=' + index;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async startMCPlaylistEn(bank, index, zone) {
		try {
			const command =
				'/netusb/manageMcPlaylist?bank=' + bank + '&type=play&index=' + index + '&zone=' + this.getZone(zone);
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//------------ NETUSB + CD + Tuner commands ------------
	async getPlayInfo(val) {
		try {
			let command;
			if (val === 'cd') {
				command = '/cd/getPlayInfo';
			} else if (val === 'tuner') {
				command = '/tuner/getPlayInfo';
			} else {
				command = '/netusb/getPlayInfo';
			}
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//------------ NETUSB + CD commands ------------
	async toggleRepeat(val) {
		try {
			let command;
			if (val === 'cd') {
				command = '/cd/toggleRepeat';
			} else {
				command = '/netusb/toggleRepeat';
			}
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async toggleShuffle(val) {
		try {
			let command;
			if (val === 'cd') {
				command = '/cd/toggleShuffle';
			} else {
				command = '/netusb/toggleShuffle';
			}
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setPlayback(val, where) {
		if (!val || val == 'play') val = 'play';
		else if (val == 'stop') val = 'stop';
		else if (val == 'pause') val = 'pause';
		else if (val == 'play_pause') val = 'play_pause';
		else if (val == 'previous') val = 'previous';
		else if (val == 'next') val = 'next';
		else if (val == 'frw_start') val = 'fast_reverse_start';
		else if (val == 'frw_end') val = 'fast_reverse_end';
		else if (val == 'ffw_start') val = 'fast_forward_start';
		else if (val == 'ffw_end') val = 'fast_forward_end';
		try {
			let command;
			if (where === 'cd') {
				command = '/cd/setPlayback?playback=' + val;
			} else {
				command = '/netusb/setPlayback?playback=' + val;
			}
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	//------------ CD commands ------------
	async setCDPlayback(val) {
		if (!val || val == 'play') val = 'play';
		else if (val == 'stop') val = 'stop';
		else if (val == 'pause') val = 'pause';
		else if (val == 'play_pause') val = 'play_pause';
		else if (val == 'previous') val = 'previous';
		else if (val == 'next') val = 'next';
		else if (val == 'frw_start') val = 'fast_reverse_start';
		else if (val == 'frw_end') val = 'fast_reverse_end';
		else if (val == 'ffw_start') val = 'fast_forward_start';
		else if (val == 'ffw_end') val = 'fast_forward_end';
		try {
			const command = '/cd/setPlayback?playback=' + val;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async toggleTray() {
		try {
			const command = '/cd/toggleTray';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async toggleCDRepeat() {
		try {
			const command = '/cd/toggleRepeat';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async toggleCDShuffle() {
		try {
			const command = '/cd/toggleShuffle';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async stopCD() {
		try {
			const command = '/cd/setPlayback?playback=stop';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async pauseCD() {
		try {
			const command = '/cd/setPlayback?playback=stop';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async playCD() {
		try {
			const command = '/cd/setPlayback?playback=play';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async nextCD() {
		try {
			const command = '/cd/setPlayback?playback=next';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async prevCD() {
		try {
			const command = '/cd/setPlayback?playback=previous';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async frwCD(state) {
		let on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/cd/setDirect?playback=' + (on ? 'fast_reverse_start' : 'fast_reverse_end');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async ffwCD(state) {
		var on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/cd/setDirect?playback=' + (on ? 'fast_forward_start' : 'fast_forward_end');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//-------------System commands------
	async getDeviceInfo() {
		try {
			const command = '/system/getDeviceInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getFeatures() {
		try {
			const command = '/system/getFeatures';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getNetworkStatus() {
		try {
			const command = '/system/getNetworkStatus';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getFuncStatus() {
		try {
			const command = '/system/getFuncStatus';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getNameText(zone) {
		try {
			const command = '/system/getNameText?id=' + zone;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getLocationInfo() {
		try {
			const command = '/system/getLocationInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setAutoPowerStandby(state, zone) {
		let on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/system/setAutoPowerStandby?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setHdmiOut1(state, zone) {
		let on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/system/setHdmiOut1?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setHdmiOut2(state, zone) {
		let on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/system/setHdmiOut2?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setPartyMode(on) {
		try {
			const command = '/system/setPartyMode?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//-----------  advanced ------------
	async setLinkControl(control, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setLinkControl?control=' + control;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setLinkAudioDelay(delay, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setLinkAudioDelay?delay=' + delay;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setLinkAudioQuality(mode, zone) {
		try {
			const command = '/' + this.getZone(zone) + '/setLinkAudioQuality?delay=' + mode;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getDistributionInfo() {
		try {
			const command = '/dist/getDistributionInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setServerInfo(data) {
		try {
			const command = '/dist/setServerInfo';
			const result = await this.SendPostToDevice(command, data);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setClientInfo(data) {
		try {
			const command = '/dist/setClientInfo';
			const result = await this.SendPostToDevice(command, data);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async startDistribution(num) {
		try {
			const command = '/dist/startDistribution?num=' + num;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async stopDistribution() {
		try {
			const command = '/dist/stopDistribution';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setGroupName(name) {
		try {
			const command = '/dist/setGroupName';
			const result = await this.SendPostToDevice(command, data);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//-----------  Tuner ------------
	async getTunerPresetInfo(band) {
		try {
			const command = '/tuner/getPresetInfo?band=' + band;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async getTunerPlayInfo() {
		try {
			const command = '/tuner/getPlayInfo';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setBand(band) {
		try {
			const command = '/tuner/setBand?band=' + band;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setFreqDirect(band, freq) {
		try {
			const command = '/tuner/setFreq?band=' + band + '&tuning=direct&num=' + freq;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async switchPresetTuner(direction) {
		try {
			const command = '/tuner/switchPreset?dir=' + direction;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setDabService(direction) {
		try {
			const command = '/tuner/setDabService?dir=' + direction;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	//-----------  Clock ------------
	async getClockSettings() {
		try {
			const command = '/clock/getSettings';
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setClockAutoSync(state) {
		let on;
		if (state === '1' || state === true || state === 1 || state === 'true') {
			on = 1;
		} else {
			on = 0;
		}
		try {
			const command = '/clock/setAutoSync?enable=' + (on ? 'true' : 'false');
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setClockDateTime(datetime) {
		try {
			const command = '/clock/setDateAndTime?date_time=' + datetime;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setClockFormat(format) {
		try {
			const command = '/clock/setClockFormat?format=' + format;
			const result = await this.SendGetToDevice(command);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async setAlarmSettings(data) {
		try {
			const command = '/clock/SetAlarmSettings';
			const result = await this.SendPostToDevice(command, data);
			return Promise.resolve(result);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	// ---- zone number to string
	getZone(zone) {
		if (!zone) return 'main';
		if (zone.length == 1) {
			zone = zone.replace('/^1', 'main');
			zone = zone.replace('/^2', 'zone2');
			zone = zone.replace('/^3', 'zone3');
			zone = zone.replace('/^4', 'zone4');
		}
		switch (zone) {
			case 1:
				zone = 'main';
				break;
			case 2:
			case 3:
			case 4:
				zone = 'zone' + zone;
		}
		return zone;
	}
}
export default YamahaYXC;
