'use strict';

const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * Flush Dimmer (ZMNHDA)
 * Manual: https://smart-telematik.se/dokument/qubino-flush-dimmer.pdf
 */
class ZMNHDA extends QubinoDimDevice {
	async onMeshInit() {
		await super.onMeshInit();

		// Register configuration dependent capabilities
		this._registerCapabilities();

		// Register input endpoints
		await this.registerInputEndpoints();
	}

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
	 * Override registering endpoints since this device has fixed endpoints on multi channel node ids 1 and 2.
	 */
	async registerInputEndpoints() {
		this.registerInputEndpointListener(1, 2);
		this.registerInputEndpointListener(2, 3);
	}

	/**
	 * Method that will register capabilities on the root device only.
	 * @private
	 */
	_registerCapabilities() {
		this.log('Configured root device');
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
		this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel);
	}
}

module.exports = ZMNHDA;
