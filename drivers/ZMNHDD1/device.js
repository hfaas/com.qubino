'use strict';

const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * Flush Dimmer (ZMNHDD)
 * Extended manual: http://qubino.com/download/2051/
 * Regular manual: http://qubino.com/download/990/
 */
class ZMNHDD extends QubinoDimDevice {

	/**
	 * Expose input configuration, two possible inputs (input 2 and input 3).
	 * @returns {*[]}
	 */
	get inputConfiguration() {
		return [
			{
				id: 2,
				parameterIndex: 100,
				flowTriggers: {
					on: 'I2_on',
					off: 'I2_off',
					toggle: 'inputTwoToggled',
				},
			},
			{
				id: 3,
				parameterIndex: 101,
				flowTriggers: {
					on: 'I3_on',
					off: 'I3_off',
					toggle: 'inputThreeToggled',
				},
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
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}
}

module.exports = ZMNHDD;
