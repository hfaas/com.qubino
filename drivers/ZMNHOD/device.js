'use strict';

const constants = require('../../lib/constants');
const QubinoShutterDevice = require('../../lib/QubinoShutterDevice');

/**
 * Flush Shutter DC (ZMNHOD)
 * Extended manual: http://qubino.com/download/2066/
 * Regular manual: http://qubino.com/download/1055/
 */
class ZMNHOD extends QubinoShutterDevice {
	async onMeshInit() {
		await super.onMeshInit();

		// Register configuration dependent capabilities
		this._registerCapabilities();
	}

	/**
	 * Method that will register capabilities based on the detected configuration of the device; it can have four
	 * different configurations (regular/with temperature sensor/venetian blind mode/venetian blind mode with
	 * temperature sensor). Since the windowcoverings_tilt capability can not be hidden when the device does not support
	 * it, an error will be shown to the user and the value will remain zero.
	 * @private
	 */
	_registerCapabilities() {

		if (this.numberOfMultiChannelNodes === 0) {
			/**
			 * Configuration: venetian blind mode is not activated and no temperature sensor connected.
			 * Regular motor control on root node.
			 */
			this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
			this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
			this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);

			// Set venetian blind motor control slider to zero, since it can not be used.
			this.setCapabilityValue(constants.capabilities.windowCoveringsTiltSet, 0);

			// Throw and show an error when user tries to control venetian blinds when venetian blind mode is disabled
			this.registerCapabilityListener(constants.capabilities.windowCoveringsTiltSet, this.handleUnconfiguredTiltSet.bind(this));
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
			this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel, {
				multiChannelNodeId: rootDeviceEndpoint,
			});

			this.registerCapability(constants.capabilities.windowCoveringsTiltSet, constants.commandClasses.switchMultilevel, constants.multiChannelNodeIdTwo);
		}

		// Register temperature sensor endpoint
		this.registerTemperatureSensorEndpoint();
	}
}

module.exports = ZMNHOD;
