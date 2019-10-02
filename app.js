'use strict';

const Homey = require('homey');
const Log = require('homey-log').Log;

/**
 * TODO: test kWh on a device and the reset functionality
 * TODO: check all settings
 * TODO: mark devices as offline while fetching settings etc.
 * TODO: switch type settings reference to parameter 20/100
 * TODO: remove temp capability if temperature sensor is not connected
 * TODO: remove migration logic after this version has been stable for a while
 * TODO: constants in settings migrations
 */
class QubinoApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
	}
}

module.exports = QubinoApp;
