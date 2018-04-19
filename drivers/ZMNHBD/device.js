'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 2 Relay (ZMNHBD)
 * Extended manual: http://qubino.com/download/2044/
 * Regular manual: http://qubino.com/download/1029/
 */
class ZMNHBD extends QubinoDevice {
	async onMeshInit() {
		await super.onMeshInit();

		/**
		 * Configuration: input 2 and input 3 enabled (parameter 100 and 101 set to 1-6 or 9).
		 * Temperature sensor connected on multi channel node id 3.
		 * Second relay control is on multi channel node id 2.
		 * First relay control is on multi channel node id 1.
		 * Root node has combined measure/meter power.
		 */
		if (this.hasCapability(constants.capabilities.meterPower)) {
			this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		}
		if (this.hasCapability(constants.capabilities.measurePower)) {
			this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		}
		if (this.hasCapability(constants.capabilities.onoff)) {
			this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		}
		if (this.hasCapability(constants.capabilities.measureTemperature)) {
			this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel, constants.multiChannelNodeIdThree);
		}

		// All on/off handlers
		if (this.hasCapability('allOn')) this.registerCapabilityListener('allOn', this.turnAllOn.bind(this));
		if (this.hasCapability('allOff')) this.registerCapabilityListener('allOff', this.turnAllOff.bind(this));
	}

	async turnAllOn() {
		if (this.hasCommandClass(constants.commandClasses.switchBinary)) {
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchBinary}`].SWITCH_BINARY_SET({ 'Switch Value': 'on/enable' });
		}
		return Promise.reject(new Error('device_does_not_support_switch_binary'));
	}

	async turnAllOff() {
		if (this.hasCommandClass(constants.commandClasses.switchBinary)) {
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchBinary}`].SWITCH_BINARY_SET({ 'Switch Value': 'off/disable' });
		}
		return Promise.reject(new Error('device_does_not_support_switch_binary'));
	}
}

module.exports = ZMNHBD;
