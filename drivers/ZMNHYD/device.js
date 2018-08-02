'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 1 Relay (ZMNHYD)
 * Extended manual: http://qubino.com/download/2302/
 * TODO: images/icons
 */
class ZMNHYD extends QubinoDevice {

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measureVoltage, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measureCurrent, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}
}

module.exports = ZMNHYD;
