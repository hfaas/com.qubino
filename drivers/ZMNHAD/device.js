'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 1 Relay (ZMNHAD)
 * Extended manual: http://qubino.com/download/1959/
 * Regular manual: http://qubino.com/download/1002/
 */
class ZMNHAD extends QubinoDevice {
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
			this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
			this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
			this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
			return;
		}

		// Register root device endpoint
		const rootDeviceEndpoint = this.findRootDeviceEndpoint();
		if (typeof rootDeviceEndpoint === 'number') {
			this.log('Configured root device on multi channel node', rootDeviceEndpoint);

			this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter, {
				multiChannelNodeId: rootDeviceEndpoint,
			});
			this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter, {
				multiChannelNodeId: rootDeviceEndpoint,
			});
			this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary, {
				multiChannelNodeId: rootDeviceEndpoint,
			});
		}

		// Register input endpoints
		this.registerInputEndpoints();

		// Register temperature sensor endpoint
		this.registerTemperatureSensorEndpoint();
	}
}

module.exports = ZMNHAD;
