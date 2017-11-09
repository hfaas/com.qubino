'use strict';

const Homey = require('homey');

class ZMNHDA2 extends Homey.Driver {

	onInit() {

		// Register input 2 flow card triggers
		this.flowTriggerDeviceMultiChannelNode = {
			1: {
				on: new Homey.FlowCardTriggerDevice('ZMNHDA2_I2_on').register(),
				off: new Homey.FlowCardTriggerDevice('ZMNHDA2_I2_off').register(),
			},
			2: {
				on: new Homey.FlowCardTriggerDevice('ZMNHDA2_I3_on').register(),
				off: new Homey.FlowCardTriggerDevice('ZMNHDA2_I3_off').register(),
			},
		};
	}
}

module.exports = ZMNHDA2;
