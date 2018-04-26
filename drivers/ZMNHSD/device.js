'use strict';

const Homey = require('homey');
const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * DIN Dimmer (ZMNHSD)
 * Regular manual: http://qubino.com/download/984/
 * Extended manual: http://qubino.com/download/2038/
 * TODO: fix temperature sensor reports
 */
class ZMNHSD extends QubinoDimDevice {
	async onMeshInit() {
		await super.onMeshInit();

		// Fetch working mode setting
		const workingMode = await this._getWorkingModeSetting();
		this.log(`found workingMode: ${workingMode}`);

		// Register configuration dependent capabilities
		this._registerCapabilities();
	}

	/**
	 * Method that fetches the working mode setting which is needed to determine if dimming is enabled or not.
	 * @returns {Promise<*>}
	 * @private
	 */
	async _getWorkingModeSetting() {
		if (typeof this.getStoreValue('workingMode') !== 'string') {
			const workingMode = await this.safeConfigurationGet(5);
			if (workingMode && workingMode.hasOwnProperty('Configuration Value')) {
				this.setSettings({ workingMode: workingMode['Configuration Value'][0].toString() });
				this.setStoreValue('workingMode', workingMode['Configuration Value'][0].toString());
				return workingMode['Configuration Value'][0].toString();
			}
			return null;
		}
		return this.getStoreValue('workingMode');
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
			this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
			this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		} else {

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
				this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary, {
					multiChannelNodeId: rootDeviceEndpoint,
				});
			}

			// Register temperature sensor endpoint
			this.registerTemperatureSensorEndpoint();
		}

		// Detect if dim is disabled
		if (this.getStoreValue('workingMode') === '1') {
			this.setCapabilityValue(constants.capabilities.dim, 0);
			this.registerCapabilityListener(constants.capabilities.dim, () => {
				if (this.hasCapability(constants.capabilities.windowCoveringsTiltSet)) {
					this.setCapabilityValue(constants.capabilities.windowCoveringsTiltSet, 0);
				}
				return Promise.reject(new Error(Homey.__('error.dim_mode_not_enabled')));
			});
		}
	}
}

module.exports = ZMNHSD;
