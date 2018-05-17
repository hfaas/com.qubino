'use strict';

const Homey = require('homey');

const constants = require('./constants');
const QubinoDevice = require('./QubinoDevice');

/**
 * This class adds basic functionality related Qubino devices supporting dimming (mostly lights), it handles setting
 * min/max dimming values.
 */
class QubinoDimDevice extends QubinoDevice {
	async onMeshInit() {
		await super.onMeshInit();
		this.registerSettings();
	}

	/**
	 * Override onSettings to check minimum and maximum dim level settings.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {Promise<T>}
	 */
	async onSettings(oldSettings, newSettings, changedKeysArr) {

		// Check if one of max/min dim value settings changed
		if (changedKeysArr.includes(constants.settings.maximumDimValue) || changedKeysArr.includes(constants.settings.minimumDimValue)) {
			const maxDimValue = newSettings[constants.settings.maximumDimValue] || oldSettings[constants.settings.maximumDimValue];
			const minDimValue = newSettings[constants.settings.minimumDimValue] || oldSettings[constants.settings.minimumDimValue];

			// Check if max dim level is not less than min dim level else throw error
			if (maxDimValue < minDimValue) {
				return Promise.reject(new Error(Homey.__('error.max_dim_level_cannot_be_lower_than_min_dim_level')));
			}
		}

		return super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * Method that handles the parsing of many shared settings.
	 */
	registerSettings() {
		super.registerSettings();

		// Multiply dim duration by 100
		this.registerSetting(constants.settings.dimDuration, value => value * 100);
	}
}

module.exports = QubinoDimDevice;
