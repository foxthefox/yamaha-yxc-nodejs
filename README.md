Yamaha-YXC-nodejs
==================
[![NPM version](http://img.shields.io/npm/v/yamaha-yxc-nodejs.svg)](https://npmjs.org/package/yamaha-yxc-nodejs)
[![NPM Downloads](https://img.shields.io/npm/dm/yamaha-yxc-nodejs.svg?style=flat)](https://npmjs.org/package/yamaha-yxc-nodejs)

[![NPM](https://nodei.co/npm/yamaha-yxc-nodejs.png?downloads=true)](https://npmjs.org/package/yamaha-yxc-nodejs)


A node module to control your Yamaha MusicCast devices (inspired by yamaha-nodejs).
This module uses the Yamaha Extended Control protocol.
It should be possible to control loudspeakers, soundbars etc.
Tested with WX-010 and YSP-1600. 

## Install
* npm install yamaha-yxc-nodejs

## Prerequisites
* To power on the yamaha, network standby has to be enabled


## Methods
```javascript
var yamaha = new YamahaYXC("192.168.xxx.yyy")
var yamaha = new YamahaYXC() // Auto-Discovery

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

    //get commands
    yamaha.getSignalInfo(zone)
    yamaha.getStatus(zone)
    yamaha.getSoundProgramList(zone)


//------------ NetUSB commands --------------

    yamaha.getPresetInfo()
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
    yamaha.frwNet(state)
    yamaha.ffwNet(state)
    
    yamaha.getListInfo(input, index, size, lang)
    yamaha.setListControl(listId, type, index, zone)

//------------ NetUSB + CD commands --------------
    yamaha.getPlayInfo(val) //if empty the netusb is called, otherwise val must be set to "cd"

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
```javascript
yamaha.powerOff().then(function(result){
	console.log("Response is" + result);
});
```

#### Discovery
If the IP is omitted in the constructor, the module will try to discover the yamaha ip via a SSDP call.

## Changelog
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


