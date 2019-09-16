'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Smart Meter (ZMNHTD)
 * Extended manual: http://qubino.com/download/2069/
 * Regular manual: http://qubino.com/download/1093/
 * TODO: maintenance action for reset meter
 */
class ZMNHTD extends QubinoDevice {

	/**
	 * Method that registers custom setting parsers.
	 */
	registerSettings() {
		super.registerSettings();
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		this.registerCapability(constants.capabilities.measureVoltage, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measureCurrent, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.meterPowerImport, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.meterPowerExport, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.powerReactive, constants.commandClasses.meter); // TODO: validate this is in kVar
		this.registerCapability(constants.capabilities.powerTotalReactive, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.powerTotalApparent, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.powerFactor, constants.commandClasses.meter);
	}
}

module.exports = ZMNHTD;
