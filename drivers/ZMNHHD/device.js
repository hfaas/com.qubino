'use strict';

const { Util } = require('homey-meshdriver');

const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * Mini Dimmer (ZMNHHD)
 * TODO: add configuration actions for calibration (par 71, par 72 is calibration result) and meter reset
 * Extended manual: https://qubino.com/manuals/Mini_Dimmer_V3.4.pdf
 */
class ZMNHHD extends QubinoDimDevice {

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	async registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}

	/**
	 * Method that handles the parsing of many shared settings.
	 */
	registerSettings() {
		super.registerSettings();

		// Override QubinoDimDevice setting handler
		this.registerSetting(constants.settings.dimDuration, value => value);

		// Conversion method expects value in milliseconds, spits out 0-127 in sec 128-253 in minutes
		this.registerSetting(constants.settings.dimDurationKeyPressed, value => Util.calculateZwaveDimDuration(value * 1000, { maxValue: 253 }));
	}
}

module.exports = ZMNHHD;
