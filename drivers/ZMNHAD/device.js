'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 1 Relay (ZMNHAD)
 * Extended manual: http://qubino.com/download/1959/
 * Regular manual: http://qubino.com/download/1002/
 */
class ZMNHAD extends QubinoDevice {

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
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}
}

module.exports = ZMNHAD;
