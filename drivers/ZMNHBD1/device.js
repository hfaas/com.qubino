'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 2 Relay (ZMNHBD)
 * Extended manual: http://qubino.com/download/2044/
 * Regular manual: http://qubino.com/download/1029/
 * TODO: add maintenance action for meter reset (both endpoints)
 */
class ZMNHBD extends QubinoDevice {

	/**
	 * Expose input configuration, two possible inputs (input 2 and input 3).
	 * @returns {*[]}
	 */
	get inputConfiguration() {
		return [
			{
				id: 2,
				parameterIndex: 100,
			},
			{
				id: 3,
				parameterIndex: 101,
			},
		];
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		if (this.hasCapability('allOn')) this.registerCapabilityListener('allOn', this.turnAllOn.bind(this));
		if (this.hasCapability('allOff')) this.registerCapabilityListener('allOff', this.turnAllOff.bind(this));
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel, constants.multiChannelNodeIdThree);

	}

	/**
	 * Method that sends a SWITCH_BINARY command to turn the device on.
	 * @returns {Promise<*>}
	 */
	async turnAllOn() {
		if (this.hasCommandClass(constants.commandClasses.switchBinary)) {
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchBinary}`].SWITCH_BINARY_SET({ 'Switch Value': 'on/enable' });
		}
		return Promise.reject(new Error('device_does_not_support_switch_binary'));
	}

	/**
	 * Method that sends a SWITCH_BINARY command to turn the device off.
	 * @returns {Promise<*>}
	 */
	async turnAllOff() {
		if (this.hasCommandClass(constants.commandClasses.switchBinary)) {
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchBinary}`].SWITCH_BINARY_SET({ 'Switch Value': 'off/disable' });
		}
		return Promise.reject(new Error('device_does_not_support_switch_binary'));
	}
}

module.exports = ZMNHBD;
