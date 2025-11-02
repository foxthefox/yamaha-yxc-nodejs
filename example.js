import { YamahaYXC } from "./index.js";

const example_ip_address = "192.168.178.22";

async function discover() {
  var yamaha = new YamahaYXC();
  try {
    const result = await yamaha.discover(5000);
    console.log(result);
    console.log("IP" + result[0].ip);
    yamaha
      .getXML("http://" + example_ip_address + ":49154/MediaRenderer/desc.xml")
      .then((result) => {
        console.log("getXML", result);
      });
  } catch (error) {
    return Promise.reject(error);
  }
}

var yamaha1 = new YamahaYXC(example_ip_address);

//var yamaha1 = new YamahaYXC('localhost:3311');

async function test() {
  try {
    const result1 = await yamaha1.getDeviceInfo();
    console.log(result1);
    var att = result1;
    console.log("dest  " + att.destination);
    console.log("api  " + att.api_version);
  } catch (error) {
    return Promise.reject(error);
  }

  try {
    const result = await yamaha1.getFeatures();
    console.log(result);
    var att = result;
    console.log(att.response_code);
    console.log(result.response_code);
    console.log("dest  " + att.system.zone_num);
    console.log("api  " + att.system.func_list);
    console.log("func list  " + JSON.stringify(att.zone[0].func_list));
    console.log("input list  " + JSON.stringify(att.system.input_list[0]));
    console.log("input 1  " + att.system.input_list[0].id);
    console.log("link list  " + JSON.stringify(att.zone[0].link_control_list));
    console.log(
      "sound list  " + JSON.stringify(att.zone[0].sound_program_list)
    );
    console.log("input zone list  " + JSON.stringify(att.zone[0].input_list));
  } catch (error) {
    return Promise.reject(error);
  }
}
console.log("discovering");
await discover();
console.log("fixed address");
await test();
console.log("end");
