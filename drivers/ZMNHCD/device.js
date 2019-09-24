'use strict';

const constants = require('../../lib/constants');
const QubinoShutterDevice = require('../../lib/QubinoShutterDevice');

/**
 * Flush Shutter (ZMNHCD)
 * Extended manual: http://qubino.com/download/2075/
 * Regular manual: http://qubino.com/download/1041/
 * TODO: maintenance actions for calibration/reset meter
 * TODO: remove/add capability tilt_set based on configuration
 * TODO: calibration, blinds need to be lowered all the way down before calibration starts
 */
class ZMNHCD extends QubinoShutterDevice {

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {

		// Always register meter power and measure power on root node
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);

		// If temperature sensor connected or venetian blind mode enabled
		if (this.numberOfMultiChannelNodes > 0) {
			this.log('multi channel configuration detected');

			// Get all multi channel nodes with device class generic: switch_multilevel
			const windowCoveringsSetMultiChannelNodeIds = this.getMultiChannelNodeIdsByDeviceClassGeneric(constants.deviceClassGeneric.switchMultilevel);

			// Register windowcoverings_set on first SWITCH_MULTILEVEL multi channel node
			this.log('register windowcoverings_set on multi channel node id', windowCoveringsSetMultiChannelNodeIds[0]);
			this.registerCapability(constants.capabilities.windowcoveringsSet, constants.commandClasses.switchMultilevel, {
				multiChannelNodeId: windowCoveringsSetMultiChannelNodeIds[0]
			});

			// Register windowcoverings_tilt_set on second SWITCH_MULTILEVEL multi channel node
			if (windowCoveringsSetMultiChannelNodeIds.length > 1) {
				this.log('register windowcoverings_tilt_set on multi channel node id', windowCoveringsSetMultiChannelNodeIds[1]);
				this.registerCapability(constants.capabilities.windowCoveringsTiltSet, constants.commandClasses.switchMultilevel, {
					multiChannelNodeId: windowCoveringsSetMultiChannelNodeIds[1]
				});
			} else {
				// Ventian blind mode disabled
				this._disableVenetianBlindMode();
			}
		} else {
			// No multi channel configuration
			this.log('no multi channel configuration');

			// Ventian blind mode disabled
			this._disableVenetianBlindMode();

			// Register windowcoverings_set on root node
			this.registerCapability(constants.capabilities.windowcoveringsSet, constants.commandClasses.switchMultilevel);
		}
	}

	_disableVenetianBlindMode() {
		this.log('venetian blind mode is disabled');
		// Set venetian blind motor control slider to zero, since it can not be used.
		this.setCapabilityValue(constants.capabilities.windowCoveringsTiltSet, 0).catch(err => this.error('windowCoveringsTiltSet failed', err));

		// Throw and show an error when user tries to control venetian blinds when venetian blind mode is disabled
		this.registerCapabilityListener(constants.capabilities.windowCoveringsTiltSet, this.handleUnconfiguredTiltSet.bind(this));
	}
}

module.exports = ZMNHCD;
