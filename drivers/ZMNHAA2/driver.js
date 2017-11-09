'use strict';

const Homey = require('homey');

// Documentation: https://www.benext.eu/static/manual/qubino/flush-1-relay-ZMNHAA2.pdf

class ZMNHAA2 extends Homey.Driver {

	onInit() {

		// Register input 2 flow card triggers
		this.flowTriggerDeviceMultiChannelNode = {
			1: {
				on: new Homey.FlowCardTriggerDevice('ZMNHAA2_I2_on').register(),
				off: new Homey.FlowCardTriggerDevice('ZMNHAA2_I2_off').register(),
			},
			2: {
				on: new Homey.FlowCardTriggerDevice('ZMNHAA2_I3_on').register(),
				off: new Homey.FlowCardTriggerDevice('ZMNHAA2_I3_off').register(),
			},
		};
	}
}

module.exports = ZMNHAA2;
