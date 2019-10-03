'use strict';

const Homey = require('homey');

const QubinoDimDevice = require('../../lib/QubinoDimDevice');
const { CAPABILITIES, COMMAND_CLASSES } = require('../../lib/constants');

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
				this.setSettings({ [SETTINGS.WORKING_MODE]: workingMode['Configuration Value'][0].toString() });
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
		this.registerCapability(CAPABILITIES.METER_POWER, COMMAND_CLASSES.METER);
		this.registerCapability(CAPABILITIES.MEASURE_POWER, COMMAND_CLASSES.METER);
		this.registerCapability(CAPABILITIES.DIM, COMMAND_CLASSES.SWITCH_MULTILEVEL);
		this.registerCapability(CAPABILITIES.ONOFF, COMMAND_CLASSES.SWITCH_BINARY);

		// Fetch working mode setting
		const workingMode = await this._getWorkingModeSetting();
		this.log(`found workingMode: ${workingMode}`);

		// Detect if dim is disabled
		if (this.getStoreValue('workingMode') === '1') {
			this.setCapabilityValue(CAPABILITIES.DIM, 0);
			this.registerCapabilityListener(CAPABILITIES.DIM, () => {
				if (this.hasCapability(CAPABILITIES.WINDOWCOVERINGS_TILT_SET)) {
					this.setCapabilityValue(CAPABILITIES.WINDOWCOVERINGS_TILT_SET, 0);
				}
				return Promise.reject(new Error(Homey.__('error.dim_mode_not_enabled')));
			});
		}
	}
}

module.exports = ZMNHSD;
