//const YamahaYXC = require('./lib/yxc_api_cmd.js');
//const YamahaYXCEmu = require('./lib/yxc_musiccastserver.js');

//module.exports = { YamahaYXC: YamahaYXC, YamahaYXCEmu: YamahaYXCEmu };

module.exports = { YamahaYXC: require('./lib/yxc_api_cmd.js'), YamahaYXCEmu: require('./lib/yxc_musiccastserver.js') };
