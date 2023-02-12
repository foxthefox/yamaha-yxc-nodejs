const YXCEmu = require('../index.js').YamahaYXCEmu;

const fs = require('fs');
const path = require('path');
console.log('PATH ist ' + path.join(__dirname, './data/'));

let port = 3311;
let testfile = 'YSP1600_312_208.json';
let testdevice = 'YSP-1600';
const YXCresponses = fs.readFileSync(path.join(__dirname, './data/') + testfile);
const deviceresp = JSON.parse(String(YXCresponses))[testdevice];

const emulation = new YXCEmu(deviceresp, port, false);
emulation.setupHttpServer(function() {});
