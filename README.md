Yamaha-YXC-nodejs
==================
[![NPM version](http://img.shields.io/npm/v/yamaha-yxc-nodejs.svg)](https://npmjs.org/package/yamaha-yxc-nodejs)
[![NPM Downloads](https://img.shields.io/npm/dm/yamaha-yxc-nodejs.svg?style=flat)](https://npmjs.org/package/yamaha-yxc-nodejs)
![Test and Release](https://github.com/foxthefox/yamaha-yxc-nodejs/workflows/Test%20and%20Release/badge.svg)


A node module to control your Yamaha MusicCast devices (inspired by yamaha-nodejs).
This library is not, in any way, affiliated or related to Yamaha Inc.. Use it at your own risk.

This module uses the Yamaha Extended Control protocol.
It should be possible to control loudspeakers, soundbars etc.
Tested with WX-010 and YSP-1600. 

## Install
* npm install yamaha-yxc-nodejs

## Prerequisites
* To power on the yamaha, network standby has to be enabled


## Methods
```javascript
const YamahaYXC = require('yamaha-yxc-nodejs').YamahaYXC;

//------------Instantiate -------------------

const yamaha = new YamahaYXC("192.168.xxx.yyy")

//-------------Zone related comands----------

    yamaha.power(on, zone)
    yamaha.powerOn(zone)
    yamaha.powerOff(zone)
    yamaha.sleep(val, zone)
    yamaha.setVolumeTo(to, zone)
    yamaha.mute(on, zone)
    yamaha.muteOn(zone)
    yamaha.muteOff(zone)
    yamaha.setInput(input, zone, mode)
    yamaha.setSound(input, zone)
    yamaha.surround(on, zone)
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
    yamaha.startMCPlaylistEn()
    
    //get commands
    yamaha.getSignalInfo(zone)
    yamaha.getStatus(zone)
    yamaha.getSoundProgramList(zone)
    yamaha.getMCPlaylists()
    yamaha.getMCPlaylistContent()


//------------ NetUSB commands --------------
    yamaha.getPresetInfo()
    yamaha.getSettings()
    yamaha.getRecentInfo()
    yamaha.clearRecentInfo()
    yamaha.setNetPlayback(val)
    yamaha.toggleNetRepeat()
    yamaha.toggleNetShuffle()
    yamaha.storePreset(num)
    yamaha.clearPreset(num)
    yamaha.recallPreset(num, zone)
    yamaha.stopNet()
    yamaha.pauseNet()
    yamaha.playNet()
    yamaha.nextNet()
    yamaha.prevNet()
    yamaha.frwNet(state)
    yamaha.ffwNet(state)
    yamaha.recallRecentItem(val, zone)
    
    yamaha.getListInfo(input, index, size, lang)
    yamaha.setListControl(listId, type, index, zone)

//------------ NetUSB + CD + Tuner commands --------------
    yamaha.getPlayInfo(val) //if empty the netusb is called, otherwise val must be set to "cd" or "tuner"

//------------ NetUSB + CD commands --------------
    yamaha.toggleRepeat(val) //if empty the netusb is called, otherwise val must be set to "cd"
    yamaha.toggleShuffle(val) //if empty the netusb is called, otherwise val must be set to "cd"
    yamaha.setPlayback(where, val) //if where is empty the netusb is called, otherwise val must be set to "cd". val is for commands e.g. 'next'

//------------ CD commands ------------

    yamaha.setCDPlayback(val)
    yamaha.toggleTray()
    yamaha.toggleCDRepeat()
    yamaha.toggleCDShuffle()
    yamaha.stopCD()
    yamaha.pauseCD()
    yamaha.playCD()
    yamaha.nextCD()
    yamaha.prevCD()
    yamaha.frwCD(state)
    yamaha.ffwCD(state)


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
    yamaha.setPartyMode(on)

//-----------  advanced ------------

    yamaha.setLinkControl(control, zone)
    yamaha.setLinkAudioDelay(delay, zone)
    yamaha.setLinkAudioQuality(mode, zone)
    yamaha.getDistributionInfo()
    yamaha.setServerInfo(data)
    yamaha.setClientInfo(data)
    yamaha.startDistribution(num)
    yamaha.stopDistribution()
    yamaha.setGroupName(name)

//-----------  Tuner ------------
    yamaha.getTunerPresetInfo(band)
    yamaha.getTunerPlayInfo()
    yamaha.setBand(band)
    yamaha.setFreqDirect(band,freq)
    yamaha.switchPresetTuner(direction)    
    yamaha.setDabService(direction)

//-----------  Clock ------------    
    yamaha.getClockSettings()
    yamaha.setClockAutoSync(state)
    yamaha.setClockDateTime(YYMMDDhhmmss)
    yamaha.setClockFormat(format)
    yamaha.setAlarmSettings(data)

```

#### Parameter, 
Some Parameter have to be determined first by calling a "get" method first.
JSON array has to be formed before calling the method.

#### Zones
The zone parameter is optional, you can pass a number or a string

#### Promises
All these methods return a promise:
The resolved promise result will have been parsed from JSON into an object if the response `content-type` was `application/json`.
```javascript
yamaha.powerOff().then(function(result){
	console.log("Response is" + result);
});
```

#### Discovery
There is an explicit function for discovery yamaha.discover(time).
If the function is called without time, then the discovery is running for 5s.
It returns an object for each device { ip, model, name, systemId, deviceId } in an array.
It is not ensured that all devices are detected in this period, in the applicatian a merge of a second run might be necessary.

## Changelog
## 3.1.0 a BREAK in the Break
* API exposes two classes the API and the Emulation, the import/require has to be changed
* no longer ES module

# 3.0.1
* move figlet, chalk to dependencies, instead devDep

## 3.0.0 BREAKING
* created as ES module
* skip node12 (no longer LTS)

### 2.0.4
* (scrounger) recallRecentItem added

### 2.0.3
* added testing
* added github actions

### 2.0.2
* add library root/request, http.request alone not working
* new API calls implemented

### 2.0.1
* for testing purpose the ip could also defined with a port e.g. localhost:3333
* changed error rejection in SendReqToDevice

## 2.0.0 BREAKING CHANGE
* different library for ssdp
* remove library root/request
* async/await functions
* no more instantiating with autodiscovery
* discovery responds with an array of found devices (not only the 1st appeering)

## 1.0.0 BREAKING CHANGE
* (alanbacon) returning paresed json instead raw 

### 0.0.14
* (alanbacon) setPartyMode
* (alanbacon) storePreset
* (alanbacon) clearPreset

### 0.0.13
* (danie1kr) zone playlist

### 0.0.12
* change deprecated request to @root/request

### 0.0.11
* add advanced setLinkAudioQuality

### 0.0.10
* improvement for setInput, getListInfo, setListControl

### 0.0.9
* added mode to setInput
* added getListInfo, setListControl

### 0.0.8
* improvement in power/standby

### 0.0.7
* tuner commands added
* clock commands added

### 0.0.6
* subscribe for update when GET send

### 0.0.5
* getPlayInfo extended for getting CD-values
* new surround(on)
* deleted parameter Zone in some functions, hence not necessary

### 0.0.4
* discovery on YamahaExtendedControl instead Manufacturer=Yamaha, because not all devices respond to MusicCast

### 0.0.3
* new method power, mute

### 0.0.2
* bugfixes to getcommands for zones, readme etc.

### 0.0.1
* intitial version

## License
Copyright (c) 2017 - 2022 foxthefox <foxthefox@wysiwis.net>

### for versions >= 2.0.0 
The MIT License (MIT)
This library is using the simple-ssdp package (MIT License).

