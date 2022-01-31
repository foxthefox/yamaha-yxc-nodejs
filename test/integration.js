var assert = require('assert');
var expect = require('chai').expect;
var YXC = require('../yxc_api_cmd.js');
const server = require('./musiccastserver.js');

/*Tests*/
describe('Musiccast-API', () => {
	before('start the Musiccast emulation', () => {
		server.setupHttpServer(function() {});
	});
	var yamaha;
	// if promise is returned = success
	it('should create a new yxc musiccast instance', function() {
		yamaha = new YXC('localhost:3311', null);
	});
	it('read deviceinfo', async () => {
		const result = await yamaha.getDeviceInfo();
		//console.log('result', result);
		expect(result.response_code).to.equal(0);
		expect(result.model_name).to.equal('YSP-1600');
		expect(result.destination).to.equal('BG');
		expect(result.device_id).to.equal('00A0DED15025');
		expect(result.system_id).to.equal('0B587073');
		expect(result.system_version).to.equal(3.12);
		expect(result.api_version).to.equal(2.08);
		expect(result.netmodule_generation).to.equal(1);
		expect(result.netmodule_version).to.equal('1924    ');
		expect(result.netmodule_checksum).to.equal('EAD51507');
		expect(result.operation_mode).to.equal('normal');
		expect(result.update_error_code).to.equal('00000000');
	});
	it('check something stupid', async () => {
		const result = await yamaha.getSignalInfo(5);
		console.log('result', result);
		expect(result.response_code).to.equal(3);
	});
});

/*
describe('login test', () => {
	const fritz = new Fritz('admin', 'password', 'http://localhost:3333', null);
	it('login success returns true', () => {
		return fritz.login_SID().then((result) => {
			assert.equal(result, true);
		});
	});
});
*/
