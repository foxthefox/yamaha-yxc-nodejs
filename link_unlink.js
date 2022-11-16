import { YamahaYXC } from './index.js';

//YSP1600 Wohnzimmer
var yamaha2 = new YamahaYXC('192.168.178.22');
//WX30 Küche
var yamaha1 = new YamahaYXC('192.168.178.23');
//group_id: '22353770006146e1a8b6735dc7a3d23a'
var groupID = '098f6bcd4621d373cade4e832627b4f6';
async function link() {
	console.log('----------LINK---------------');
	try {
		const clientpayload = { group_id: groupID, zone: [ 'main' ] };
		const masterpayload = { group_id: groupID, zone: 'main', type: 'add', client_list: [ '192.168.178.23' ] };
		const result1 = await yamaha1.setClientInfo(JSON.stringify(clientpayload));
		console.log('setClientInfo ', result1);
		const result2 = await yamaha2.setServerInfo(JSON.stringify(masterpayload));
		console.log('setServerInfo', result2);
		const result3 = await yamaha2.startDistribution(0);
		console.log('startDistribution', result3);
		const result4 = await yamaha2.getDistributionInfo();
		console.log('getDistributionInfo', result4);
	} catch (error) {
		return Promise.reject(error);
	}
}

async function unlink() {
	console.log('----------UNLINK---------------');
	try {
		const clientpayload = { group_id: '', zone: [ 'main' ] };
		const masterpayload = {
			group_id: '',
			zone: 'main',
			type: 'remove',
			client_list: [ '192.168.178.23' ]
		};
		const result5 = await yamaha2.getDistributionInfo();
		console.log('getDistributionInfo', result5);
		/*
		const result2 = await yamaha2.stopDistribution(JSON.stringify('0'));
		console.log('stopDistribution', result2);
        */
		const result1 = await yamaha1.setClientInfo(JSON.stringify(clientpayload));
		console.log('setClientInfo', result1);
		const result3 = await yamaha2.setServerInfo(JSON.stringify(masterpayload));
		console.log('setServerInfo', result3);
		const result6 = await yamaha2.startDistribution(0);
		console.log('startDistribution', result6);
		const result4 = await yamaha2.getDistributionInfo();
		console.log('getDistributionInfo', result4);
	} catch (error) {
		return Promise.reject(error);
	}
}
async function test() {
	await link();
	await new Promise((cb) => setTimeout(cb, 5000));
	await unlink();
}
test();
