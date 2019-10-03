'use strict';

const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * Flush Dimmer 0 - 10V (ZMNHVD)
 * Extended manual: http://qubino.com/download/2047/
 * Regular manual: http://qubino.com/download/996/
 * TODO: switching input 1 does not have any effect
 * TODO: add support for analogue sensor connected to input 1
 */
class ZMNHVD extends QubinoDimDevice {

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
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}
}

module.exports = ZMNHVD;
