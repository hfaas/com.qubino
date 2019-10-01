'use strict';

const constants = require('../../lib/constants');
const QubinoThermostatDevice = require('../../lib/QubinoThermostatDevice');
const MeshDriverUtil = require('homey-meshdriver').Util;

/**
 * Flush On/Off Thermostat (ZMNHIA)
 * TODO: migrate capabilities
 */
class ZMNHIA extends QubinoThermostatDevice {

	/**
	 * Override allOnAllOff Z-Wave setting size.
	 * @returns {number}
	 */
	static get allOnAllOffSize() {
		return 1;
	}

	/**
	 * Override default multi channel configuration.
	 * @returns {boolean}
	 */
	get multiChannelConfigurationDisabled() {
		return true;
	}

	/**
	 * Expose input configuration, two possible inputs (input 1 and input 2).
	 * @returns {*[]}
	 */
	get inputConfiguration() {
		return [
			{
				id: 2,
				defaultEnabled: true,
			},
			{
				id: 3,
				defaultEnabled: true,
			},
		];
	}

	/**
	 * Override onSettings to handle combined z-wave settings.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {Promise<T>}
	 */
	async onSettings(oldSettings, newSettings, changedKeysArr) {

		// If enabled/disabled
		if (changedKeysArr.includes(constants.settings.antifreezeEnabled)) {

			let antifreezeValue = 255;
			if (newSettings[constants.settings.antifreezeEnabled]) {
				// Get value from newSettings if possible, else use stored setting value
				antifreezeValue = newSettings.hasOwnProperty(constants.settings.antifreeze) ? newSettings[constants.settings.antifreeze] : oldSettings[constants.settings.antifreeze];
			}

			if (!(constants.settings.antifreeze in changedKeysArr)) changedKeysArr.push(constants.settings.antifreeze);
			newSettings[constants.settings.antifreeze] = antifreezeValue;
		}

		// If enabled/disabled
		if (changedKeysArr.includes(constants.settings.setpointInput2Enabled)) {

			let setpointInput2Value = 65535;
			if (newSettings[constants.settings.setpointInput2Enabled]) {
				// Get value from newSettings if possible, else use stored setting value
				setpointInput2Value = newSettings.hasOwnProperty(constants.settings.setpointInput2) ? newSettings[constants.settings.setpointInput2] : oldSettings[constants.settings.setpointInput2];
			}

			if (!(constants.settings.setpointInput2 in changedKeysArr)) changedKeysArr.push(constants.settings.setpointInput2);
			newSettings[constants.settings.setpointInput2] = setpointInput2Value;
		}

		// If enabled/disabled
		if (changedKeysArr.includes(constants.settings.setpointInput3Enabled)) {

			let setpointInput3Value = 65535;
			if (newSettings[constants.settings.setpointInput3Enabled]) {
				// Get value from newSettings if possible, else use stored setting value
				setpointInput3Value = newSettings.hasOwnProperty(constants.settings.setpointInput3) ? newSettings[constants.settings.setpointInput3] : oldSettings[constants.settings.setpointInput3];
			}

			if (!(constants.settings.setpointInput3 in changedKeysArr)) changedKeysArr.push(constants.settings.setpointInput3);
			newSettings[constants.settings.setpointInput3] = setpointInput3Value;
		}

		return super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * Method that registers custom setting parsers.
	 */
	registerSettings() {
		super.registerSettings();

		this.registerSetting(constants.settings.setpointInput2, value => {
			if (!value || value === 65535) return value;
			if (value >= 0) return value * 10;
			return 1000 + Math.abs(value * 10);
		});

		this.registerSetting(constants.settings.temperatureHysteresisOn, value => {
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -12.7, 128, 255, value);
		});

		this.registerSetting(constants.settings.temperatureHysteresisOn, value => {
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -12.7, 128, 255, value);
		});

		this.registerSetting(constants.settings.antifreeze, value => {
			if (!value || value === 255) return value;
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -12.6, 128, 254, value);
		});

		this.registerSetting(constants.settings.tooLowTemperatureLimit, value => value * 10);
		this.registerSetting(constants.settings.tooHighTemperatureLimit, value => value * 10);
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel);
		this.registerCapability(constants.capabilities.targetTemperature, constants.commandClasses.thermostatSetpoint);
		this.registerCapability(constants.capabilities.offAutoThermostatMode, constants.commandClasses.thermostatMode, {
			get: 'THERMOSTAT_MODE_GET',
			getOpts: {
				getOnStart: true,
			},
			set: 'THERMOSTAT_MODE_SET',
			setParser: mode => ({
				Level: {
					Mode: (mode === 'off') ? 'Off' : 'Auto',
				},
			}),
			report: 'THERMOSTAT_MODE_REPORT',
			reportParser: report => {
				if (report && report.hasOwnProperty('Level') &&
					report.Level.hasOwnProperty('Mode') &&
					typeof report.Level.Mode !== 'undefined') {

					// Trigger flow
					this.driver.triggerFlow(constants.flows.offAutoThermostatModeChanged, this, {}, { mode: report.Level.Mode.toLowerCase() }).catch(err => this.error('failed to trigger flow', constants.flows.offAutoThermostatModeChanged, err));
					return report.Level.Mode.toLowerCase();
				}
				return null;
			},
		});
	}
}

module.exports = ZMNHIA;
