Yamaha-YXC-nodejs
==================
[![NPM version](http://img.shields.io/npm/v/iobroker.yamaha-yxc-nodejs.svg)](https://npmjs.org/package/yamaha-yxc-nodejs)
[![NPM Downloads](https://img.shields.io/npm/dm/yamaha-yxc-nodejs.svg?style=flat)](https://npmjs.org/package/yamaha-yxc-nodejs)

[![NPM](https://nodei.co/npm/iobroker.yamaha-yxc-nodejs.png?downloads=true)](https://npmjs.org/package/yamaha-yxc-nodejs)


A node module to control your yamaha MusicCast devices (inspired by yamaha-nodejs).
This module uses the Yamaha Extended Control protocol.
It should be passible to control loudspeakers, soundbars etc.
Tested with WX-010 and YSP-1600. 

### Install
npm install yamaha-yxc-nodejs

## Prerequisites
* To power on the yamaha, network standby has to be enabled


## Methods
```javascript
var yamaha = new YamahaYXC("192.168.xxx.yyy")
var yamaha = new YamahaYXC() // Auto-Discovery

//-------------Zone related comands----------

    yamaha.powerOn(zone)
    yamaha.powerOff(zone)
    yamaha.sleep(val, zone)
    yamaha.setVolumeTo(to, zone)
    yamaha.muteOn(zone)
    yamaha.muteOff(zone)
    yamaha.setInput(input, zone)
    yamaha.setSound(input, zone)
    yamaha.surroundOn(zone)
    yamaha.surroundOff(zone)
    yamaha.setDirect(on, zone)
    yamaha.setPureDirect(on, zone)
    yamaha.setEnhancer(on, zone)
    yamaha.setClearVoice(on, zone)
    yamaha.setBassTo(val, zone)
    yamaha.setTrebleTo(val, zone)
    yamaha.setEqualizer(low, mid, high, zone)
    yamaha.setBalance(val, zone)
    yamaha.setSubwooferVolumeTo(val, zone)
    yamaha.setBassExtension(on, zone)

    //get commands
    yamaha.getSignalInfo(zone)
    yamaha.getStatus(zone)
    yamaha.getSoundProgramList(zone)


//------------ NetUSB commands --------------

    yamaha.getPresetInfo()
    yamaha.getPlayInfo()
    yamaha.getSettings()
    yamaha.getRecentInfo()
    yamaha.clearRecentInfo()
    yamaha.setNetPlayback(val)
    yamaha.toggleNetRepeat()
    yamaha.toggleNetShuffle()
    yamaha.recallPreset(val, zone)
    yamaha.stopNet()
    yamaha.pauseNet()
    yamaha.playNet()
    yamaha.nextNet()
    yamaha.prevNet()
    yamaha.frwNet(state, zone)
    yamaha.ffwNet(state, zone)

//------------ CD commands ------------

    yamaha.setCDPlayback(val, zone)
    yamaha.toggleTray(on)
    yamaha.toggleCDRepeat(on)
    yamaha.toggleCDShuffle(on)
    yamaha.stopCD(zone)
    yamaha.pauseCD(zone)
    yamaha.playCD(zone)
    yamaha.nextCD(zone)
    yamaha.prevCD(zone)
    yamaha.frwCD(state, zone)
    yamaha.ffwCD(state, zone)


//-------------System commands------
    yamaha.getDeviceInfo()
    yamaha.getFeatures()
    yamaha.getNetworkStatus()
    yamaha.getFuncStatus()
    yamaha.getNameText(zone)
    yamaha.getLocationInfo()
    yamaha.setAutoPowerStandby(state, zone)   
    yamaha.setHdmiOut1(state, zone)
    yamaha.setHdmiOut2(state, zone)

//-----------  advanced ------------

    yamaha.setLinkControl(control, zone)
    yamaha.setLinkAudioDelay(delay, zone)
    yamaha.getDistributionInfo()
    yamaha.setServerInfo(data)
    yamaha.setClientInfo(data)
    yamaha.startDistribution(num)
    yamaha.stopDistribution()
    yamaha.setGroupName(name)

```

#### Parameter, 
Some Parameter have to be determined first by calling a "get" method first.
JSON array has to be formed before calling the method.

#### Zones
The zone parameter is optional, you can pass a number or a string

#### Promises
All these methods return a promise:
```javascript
yamaha.powerOff().then(function(result){
	console.log("Respones is" + result);
});
```

#### Discovery
If the IP is omitted in the constructor, the module will try to discover the yamaha ip via a SSDP call.

## Changelog

### 0.0.1
* intitial version


