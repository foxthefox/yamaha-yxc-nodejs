var YamahaYXC = require("./yamahayxc.js");
var yamaha = new YamahaYXC();

yamaha.discover().then(function(result){
 	console.log(result);
     console.log('IP' + result[0]);
});



var yamaha1 = new YamahaYXC("192.168.178.52");

yamaha1.getDeviceInfo().done(function(result){
 	console.log(result);
     var att = JSON.parse(result);
     console.log('dest  ' + att.destination);
     console.log('api  ' + att.api_version);
});


yamaha1.getFeatures().done(function(result){
 	console.log(result);
     console.log(result.response_code);
     var att = JSON.parse(result);
     console.log(att.response_code);
     console.log(JSON.parse(result).response_code);
     console.log('dest  ' + att.system.zone_num);
     console.log('api  ' + att.system.func_list);
     console.log('func list  ' + JSON.stringify(att.zone[0].func_list));
     console.log('input list  ' + JSON.stringify(att.system.input_list[0]));
     console.log('input 1  ' + att.system.input_list[0].id);
     console.log('link list  ' + JSON.stringify(att.zone[0].link_control_list));
     console.log('sound list  ' + JSON.stringify(att.zone[0].sound_program_list));
     console.log('input zone list  ' + JSON.stringify(att.zone[0].input_list));
});
