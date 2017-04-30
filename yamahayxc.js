var api_cmd = require('./yxc_api_cmd');
var Promise = require("bluebird");

/**
 * The Yamaha Module Constructor.
 * @constructor
 * @param {string} ip - The ip of the yamaha receiver.
 * @param {number} responseDelay - The delay of the response for put commands, in seconds - defaults to 1. The receiver needs some time to process the changes PUT methods. Easier than polling...
 * @param {number} requestTimeout - The requestTimeout for each request send to the receiver
 *
 */
function YamahaYXC(ip, responseDelay, requestTimeout)
{
    if (typeof responseDelay == 'string' || responseDelay instanceof String) responseDelay = parseInt(responseDelay);
    if (!responseDelay) responseDelay = 1;
    this.ip = ip;
    this.responseDelay = responseDelay;
    this.pollingDelay = 500; // used for menu ready check, webradio e.g.
    this.requestTimeout = requestTimeout;
    this.catchRequestErrors = true
}

extend(YamahaYXC.prototype, api_cmd.prototype);


function extend(destination , source) {
    for (var k in source) {
        destination[k] = source[k];
    }
}

module.exports = YamahaYXC;