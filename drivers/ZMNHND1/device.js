'use strict';

const QubinoDevice = require('../../lib/QubinoDevice');
const { CAPABILITIES, COMMAND_CLASSES } = require('../../lib/constants');

/**
 * Flush 1D Relay (ZMNHND)
 * Extended manual: http://qubino.com/download/2041/
 * Regular manual: http://qubino.com/download/1014/
 */
class ZMNHND extends QubinoDevice {

	/**
	 * Expose input configuration, one possible input (input 2).
	 * @returns {*[]}
	 */
	get inputConfiguration() {
		return [
			{
        INPUT_ID: 2,
				PARAMETER_INDEX: 100,
        FLOW_TRIGGERS: {
					ON: 'I2_on',
					OFF: 'I2_off',
					TOGGLE: 'inputTwoToggled',
				},
			},
		];
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(CAPABILITIES.ONOFF, COMMAND_CLASSES.SWITCH_BINARY);
	}
}

module.exports = ZMNHND;
