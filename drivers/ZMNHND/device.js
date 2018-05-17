'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

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
				id: 2,
				parameterIndex: 100,
			},
		];
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}
}

module.exports = ZMNHND;
