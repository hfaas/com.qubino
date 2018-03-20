'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

const ALL_ON_ALL_OFF_SIZE = 2;
const ALL_ON_SETTING = 'allOn';
const ALL_OFF_SETTING = 'allOff';
const ALL_ON_ALL_OFF_PARAMETER_ID = 10;
const VENETIAN_BLIND_MODE_SETTING = 'operatingMode';
const RE_PAIR_SAVE_MESSAGE = {
	en: 'Device settings have been saved, re-pairing (without resetting) the device to Homey is required to activate the setting. Wait 30 seconds after removing before re-pairing.',
	nl: 'Apparaatinstellingen bijgewerkt, het apparaat moet opnieuw worden toegevoegd aan Homey om gebruik te maken van de nieuwe instellingen. Wacht 30 seconden na het verwijderen voor het opnieuw toevoegen.',
};

class GenericShutterDevice extends ZwaveDevice {
	async onMeshInit() {
		super.onMeshInit();
	}

	/**
	 * Override onSettings to handle combined z-wave settings.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {Promise<T>}
	 */
	async onSettings(oldSettings, newSettings, changedKeysArr) {

		// Handle all on/all off settings
		if (changedKeysArr.includes(ALL_ON_SETTING) || changedKeysArr.includes(ALL_OFF_SETTING)) {
			const allOnAllOf = GenericShutterDevice._combineAllOnAllOffSettings(newSettings);

			await this.configurationSet({ index: ALL_ON_ALL_OFF_PARAMETER_ID, size: ALL_ON_ALL_OFF_SIZE }, allOnAllOf);

			// Remove all on all off changed keys
			changedKeysArr = [...changedKeysArr.filter(changedKey => changedKey !== ALL_ON_SETTING && changedKey !== ALL_OFF_SETTING)];
		}

		return super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * When venetian blind mode setting was changed notify user of the need to re-pair.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {{en: string, nl: string}}
	 */
	customSaveMessage(oldSettings, newSettings, changedKeysArr) {
		if (changedKeysArr.includes(VENETIAN_BLIND_MODE_SETTING)) {
			return RE_PAIR_SAVE_MESSAGE;
		}
	}

	/**
	 * Combine two settings (all on/all off) into one value.
	 * @param newSettings
	 * @returns {number}
	 * @private
	 */
	static _combineAllOnAllOffSettings(newSettings) {
		const allOn = newSettings[ALL_ON_SETTING];
		const allOff = newSettings[ALL_OFF_SETTING];
		if (allOn && allOff) return 255;
		else if (allOn && !allOff) return 2;
		else if (!allOn && allOff) return 1;
		return 0;
	}

	/**
	 * Method that will send a configuration parameter to the device which in turn starts the calibration process.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _startCalibration() {
		await this.configurationSet({ index: 78, size: 1 }, 1);
	}

	/**
	 * Method that will reset the windowcoverings_tilt value to zero and throws an error to indicate that venetian mode
	 * is not enabled.
	 * @returns {Promise<never>}
	 * @private
	 */
	_handleUnconfiguredTiltSet() {
		this.setCapabilityValue('windowcoverings_tilt_set', 0);
		return Promise.reject(new Error(Homey.__('error.venetian_mode_not_enabled')));
	}
}

module.exports = GenericShutterDevice;
