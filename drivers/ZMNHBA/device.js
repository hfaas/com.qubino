'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 2 Relay (ZMNHBA)
 * Manual: http://www.benext.eu/static/manual/qubino/flush-2-relays-ZMNHBA2.pdf
 */
class ZMNHBA extends QubinoDevice {

	/**
	 * Override allOnAllOff Z-Wave setting size.
	 * @returns {number}
	 */
	static get allOnAllOffSize() {
		return 1;
	}

	/**
	 * Override default multi channel configuration.
	 * @returns {boolean}
	 */
	get multiChannelConfigurationDisabled() {
		return true;
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel);
	}

	/**
	 * Method that will register custom setting parsers for this device.
	 */
	registerSettings() {
		super.registerSettings();
		this.registerSetting(constants.settings.autoOffQ1, value => value * 100);
		this.registerSetting(constants.settings.autoOffQ2, value => value * 100);
	}
}

module.exports = ZMNHBA;