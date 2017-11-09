'use strict';

const Homey = require('homey');
const Log = require('homey-log').Log;

class QubinoApp extends Homey.App {
	onInit(){
		this.log(`${Homey.manifest.id} running...`);
	}
}

module.exports = QubinoApp;