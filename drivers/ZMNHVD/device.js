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
	async onMeshInit() {
		await super.onMeshInit();

		// Register configuration dependent capabilities
		this._registerCapabilities();
	}

	/**
	 * Method that will register capabilities based on the detected configuration of the device; it can have eight
	 * different configurations (with/without temperature sensor, input 2 enabled/disabled, input 3 enabled/disabled).
	 * @private
	 */
	_registerCapabilities() {

		// Only register root device, no inputs, no temperature sensor
		if (this.numberOfMultiChannelNodes === 0) {
			this.log('Configured root device');
			this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
			this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchMultilevel);
		} else {

			// Register root device endpoint
			const rootDeviceEndpoint = this.findRootDeviceEndpoint();
			if (typeof rootDeviceEndpoint === 'number') {
				this.log('Configured root device on multi channel node', rootDeviceEndpoint);

				this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel, {
					multiChannelNodeId: rootDeviceEndpoint,
				});
				this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchMultilevel, {
					multiChannelNodeId: rootDeviceEndpoint,
				});

			}

			// Register temperature sensor endpoint
			this.registerTemperatureSensorEndpoint();
		}
	}
}

module.exports = ZMNHVD;
