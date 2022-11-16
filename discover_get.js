import { YamahaYXC } from './index.js';
// import { YamahaYXC } from 'yamaha-yxc-nodejs';

async function discover() {
	var yamaha = new YamahaYXC();
	try {
		const result = await yamaha.discover();
		console.table(result);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(error);
	}
}

async function discoverAndGet() {
	let found = [];
	try {
		const devicearray = await discover();
		if (devicearray) {
			await Promise.all(
				devicearray.map(async (device) => {
					let data = {};
					data[device.name] = {};
					const yamaha = new YamahaYXC(device.ip);
					data[device.name]['system'] = {};
					const getDeviceInfo = await yamaha['getDeviceInfo']();
					data[device.name]['system']['getDeviceInfo'] = getDeviceInfo;
					const getNetworkStatus = await yamaha.getNetworkStatus();
					data[device.name]['system']['getNetworkStatus'] = getNetworkStatus;
					const getFuncStatus = await yamaha.getFuncStatus();
					data[device.name]['system']['getFuncStatus'] = getFuncStatus;
					const getLocationInfo = await yamaha.getLocationInfo();
					data[device.name]['system']['getLocationInfo'] = getLocationInfo;
					const getFeatures = await yamaha.getFeatures();
					data[device.name]['system']['getFeatures'] = getFeatures;
					data[device.name]['dist'] = {};
					const getDistributionInfo = await yamaha.getDistributionInfo();
					data[device.name]['dist']['getFeatures'] = getDistributionInfo;
					if (getFeatures['netusb']) {
						data[device.name]['netusb'] = {};
						const getNetPlayInfo = await yamaha.getPlayInfo();
						data[device.name]['netusb']['getPlayInfo'] = getNetPlayInfo;
						const getPresetInfo = await yamaha.getPresetInfo();
						data[device.name]['netusb']['getPresetInfo'] = getPresetInfo;
						const getSettings = await yamaha.getSettings();
						data[device.name]['netusb']['getSettings'] = getSettings;
						const getRecentInfo = await yamaha.getRecentInfo();
						data[device.name]['netusb']['getRecentInfo'] = getRecentInfo;
					}
					if (getFeatures['tuner']) {
						data[device.name]['tuner'] = {};
						const getTunerPlayInfo = await yamaha.getTunerPlayInfo();
						data[device.name]['tuner']['getPlayInfo'] = getTunerPlayInfo;
						const getTunerPresetInfo = await yamaha.getTunerPresetInfo();
						data[device.name]['tuner']['getPresetInfo'] = getTunerPresetInfo;
					}
					if (getFeatures['cd']) {
						data[device.name]['cd'] = {};
						const getCdPlayInfo = await yamaha.getPlayInfo('cd');
						data[device.name]['cd']['getPlayInfo'] = getCdPlayInfo;
					}
					if (getFeatures['clock']) {
						data[device.name]['clock'] = {};
						const getClockSettings = await yamaha.getClockSettings();
						data[device.name]['clock']['getSettings'] = getClockSettings;
					}
					if (getFeatures['zone']) {
						await Promise.all(
							getFeatures['zone'].map(async (zone) => {
								data[device.name][zone.id] = {};
								const getStatus = await yamaha.getStatus();
								data[device.name][zone.id]['getStatus'] = getStatus;
								const getSoundProgramList = await yamaha.getSoundProgramList();
								data[device.name][zone.id]['getSoundProgramList'] = getSoundProgramList;
								const getSignalInfo = await yamaha.getSoundProgramList();
								data[device.name][zone.id]['getSignalInfo'] = getSignalInfo;
							})
						);
					}

					found.push(data);
				})
			);
			return Promise.resolve(found);
		}
	} catch (error) {
		return Promise.reject(error);
	}
}

discoverAndGet().then((res) => {
	console.table(res);
	console.log(res[0]);
	console.log(JSON.stringify(res[0]));
	console.log(JSON.stringify(res[1]));
});
