'use strict';

const Homey = require('homey');

const constants = require('./constants');
const QubinoDevice = require('./QubinoDevice');

/**
 * This class extends QubinoDevice and adds some Qubino Shutter device functionality, such as a custom save message
 * which indicates that the device needs to be re-paired after changing it, a calibration method, and a method that
 * handles tilt set commands when they are unsupported.
 */
class QubinoShutterDevice extends QubinoDevice {

	/**
	 * When venetian blind mode setting was changed notify user of the need to re-pair.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {{en: string, nl: string}}
	 */
	customSaveMessage(oldSettings, newSettings, changedKeysArr = []) {
		if (changedKeysArr.includes(constants.settings.operatingMode)) {
			return Homey.__('settings.re_pair_required');
		}
		return super.customSaveMessage();
	}

	/**
	 * Override onSettings to invert the capability values when the invert settigns are changed.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {Promise<T>}
	 */
	async onSettings(oldSettings, newSettings, changedKeysArr) {

		// Check if one of the invert settings changed if so invert the capability value
		if (changedKeysArr.includes(constants.settings.invertWindowCoveringsTiltDirection) &&
			this.hasCapability(constants.capabilities.windowCoveringsTiltSet)) {
			this.setCapabilityValue(constants.capabilities.windowCoveringsTiltSet, 1 - this.getCapabilityValue(constants.capabilities.windowCoveringsTiltSet));
		}
		if (changedKeysArr.includes(constants.settings.invertWindowCoveringsDirection) &&
			this.hasCapability(constants.capabilities.dim)) {
			this.setCapabilityValue(constants.capabilities.dim, 1 - this.getCapabilityValue(constants.capabilities.dim));
		}

		return super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * Method that will send a configuration parameter to the device which in turn starts the calibration process.
	 * TODO: maintenance action
	 * TODO: reset to zero after calibration is done
	 * @returns {Promise<void>}
	 * @private
	 */
	async startCalibration() {
		await this.configurationSet({ index: 78, size: 1 }, 1);
	}

	/**
	 * Method that will reset the windowcoverings_tilt value to zero and throws an error to indicate that venetian mode
	 * is not enabled.
	 * @returns {Promise<never>}
	 */
	handleUnconfiguredTiltSet() {
		if (this.hasCapability(constants.capabilities.windowCoveringsTiltSet)) {
			this.setCapabilityValue(constants.capabilities.windowCoveringsTiltSet, 0);
		}
		return Promise.reject(new Error(Homey.__('error.venetian_mode_not_enabled')));
	}

	/**
	 * Method that handles the parsing of many shared settings.
	 */
	registerSettings() {

		// Multiply motor operation detection by 10
		this.registerSetting(constants.settings.motorOperationDetection, value => value * 10);

		// Multiply slats tilting time by 100
		this.registerSetting(constants.settings.slatsTiltingTime, value => value * 100);

		// Multiply motor moving time by 10
		this.registerSetting(constants.settings.motorMovingTime, value => value * 10);

		// Multiply power report delay time by 10
		this.registerSetting(constants.settings.powerReportDelayTime, value => value * 10);

		// Multiply delay between motor movement by 10
		this.registerSetting(constants.settings.delayBetweenMotorMovement, value => value * 10);

		// Multiply motor off delay limit switch by 10
		this.registerSetting(constants.settings.motorOffDelayLimitSwitch, value => value * 10);
	}
}

module.exports = QubinoShutterDevice;
