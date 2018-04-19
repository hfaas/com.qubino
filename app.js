'use strict';

const Homey = require('homey');
const Log = require('homey-log').Log;

/**
 * TODO: test kWh on a device and the reset functionality
 * TODO: check all settings
 */
class QubinoApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
	}
}

module.exports = QubinoApp;
