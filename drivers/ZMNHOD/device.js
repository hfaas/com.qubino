'use strict';

const constants = require('../../lib/constants');
const QubinoShutterDevice = require('../../lib/QubinoShutterDevice');

/**
 * Flush Shutter DC (ZMNHOD)
 * Extended manual: http://qubino.com/download/2066/
 * Regular manual: http://qubino.com/download/1055/
 * TODO: maintenance actions for calibration/reset meter
 */
class ZMNHOD extends QubinoShutterDevice {

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);

		if (this.numberOfMultiChannelNodes === 0) {
			// Set venetian blind motor control slider to zero, since it can not be used.
			this.setCapabilityValue(constants.capabilities.windowCoveringsTiltSet, 0);

			// Throw and show an error when user tries to control venetian blinds when venetian blind mode is disabled
			this.registerCapabilityListener(constants.capabilities.windowCoveringsTiltSet, this.handleUnconfiguredTiltSet.bind(this));

		} else {
			this.registerCapability(constants.capabilities.windowCoveringsTiltSet, constants.commandClasses.switchMultilevel, constants.multiChannelNodeIdTwo);
		}
	}
}

module.exports = ZMNHOD;
