'use strict';

const QubinoDevice = require('../../lib/QubinoDevice');
const { CAPABILITIES, COMMAND_CLASSES } = require('../../lib/constants');

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
        INPUT_ID: 2,
        PARAMETER_INDEX: 100,
			},
			{
        INPUT_ID: 3,
        PARAMETER_INDEX: 101,
			},
		];
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(CAPABILITIES.METER_POWER, COMMAND_CLASSES.METER);
		this.registerCapability(CAPABILITIES.MEASURE_POWER, COMMAND_CLASSES.METER);
		this.registerCapability(CAPABILITIES.ONOFF, COMMAND_CLASSES.SWITCH_BINARY);
	}
}

module.exports = ZMNHAD;
