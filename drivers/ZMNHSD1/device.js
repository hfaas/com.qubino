'use strict';

const Homey = require('homey');
const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * DIN Dimmer (ZMNHSD)
 * Regular manual: http://qubino.com/download/984/
 * Extended manual: http://qubino.com/download/2038/
 */
class ZMNHSD extends QubinoDimDevice {

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
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	async registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.basic); // TODO test reversed state

		// Fetch working mode setting
		const workingMode = await this._getWorkingModeSetting();
		this.log(`found workingMode: ${workingMode}`);

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
