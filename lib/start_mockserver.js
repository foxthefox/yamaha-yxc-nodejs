const YXCEmu = require('../index.js').YamahaYXCEmu;

let port = 3311;
let testfile = 'YSP1600_312_208.json';
let testdevice = 'YSP-1600';
const emulation = new YXCEmu(testfile, testdevice, port, false);
emulation.setupHttpServer(function() {});
