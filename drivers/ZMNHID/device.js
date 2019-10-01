'use strict';

const constants = require('../../lib/constants');
const QubinoThermostatDevice = require('../../lib/QubinoThermostatDevice');
const MeshDriverUtil = require('homey-meshdriver').Util;

/**
 * Flush On/Off Thermostat (ZMNHID)
 * Extended manual: http://qubino.com/download/2057/
 * Regular manual: http://qubino.com/download/1061/
 *
 * Note: this device sends ALARM_REPORTS but does not advertise this as a support command class in its NIF.
 * Therefore, the settings enableInput1/enableInput2/enableInput3 can only accept value 9 SENSOR_BINARY_REPORT.
 *
 * Note 2: this device sends ALARM_REPORTS but does not advertise this as a support command class in its NIF.
 * Therefore, the status of the thermostat mode can not be updated when switched manually.
 */
class ZMNHID extends QubinoThermostatDevice {

	/**
	 * Expose input configuration, three possible inputs (input 1, input 2 and input 3).
	 * @returns {*[]}
	 */
	get inputConfiguration() {
		return [
			{
				id: 1,
				parameterIndex: 100,
			},
			{
				id: 2,
				parameterIndex: 101,
			},
			{
				id: 3,
				parameterIndex: 102,
			},
		];
	}

	/**
	 * Expose root device class generic.
	 * @returns {string}
	 */
	get rootDeviceClassGeneric() {
		return constants.deviceClassGeneric.thermostat;
	}

	/**
	 * Method that registers custom setting parsers.
	 */
	registerSettings() {
		super.registerSettings();

		this.registerSetting(constants.settings.temperatureHysteresisOn, value => {
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
		});

		this.registerSetting(constants.settings.temperatureHysteresisOff, value => {
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
		});

		this.registerSetting(constants.settings.antifreeze, value => {
			if (!value || value === 255) return value;
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -12.6, 1001, 1126, value);
		});

		this.registerSetting(constants.settings.tooLowTemperatureLimit, value => {
			if (value >= 0) return value * 10;
			return MeshDriverUtil.mapValueRange(-0.1, -15, 1001, 1150, value);
		});

		this.registerSetting(constants.settings.tooHighTemperatureLimit, value => value * 10);
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	async registerCapabilities() {
		const thermostatMode = await this._getThermostatModeSetting();
		this.log(`found thermostatMode: ${thermostatMode}`);

		// Used by thermostatSetpoint command class
		this.thermostatSetpointType = `${thermostatMode}ing 1`;
		this.log(`determined thermostatSetpointType: ${this.thermostatSetpointType}`);

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
					Mode: (mode === 'off') ? 'Off' : thermostatMode,
				},
			}),
			report: 'THERMOSTAT_MODE_REPORT',
			reportParser: report => {
				if (report && report.hasOwnProperty('Level') &&
					report.Level.hasOwnProperty('Mode') &&
					typeof report.Level.Mode !== 'undefined') {
					if (report.Level.Mode.toLowerCase() === 'heat' || report.Level.Mode.toLowerCase() === 'cool') {

						// Update the thermostatMode since it may be overriden by input 3
						this.setSettings({ thermostatMode: report.Level.Mode === 'Heat' ? '0' : '1' });
						this.setStoreValue('thermostatMode', report.Level.Mode);

						// Trigger flow
						this.driver.triggerFlow(constants.flows.offAutoThermostatModeChanged, this, {}, { mode: 'auto' }).catch(err => this.error('failed to trigger flow', constants.flows.offAutoThermostatModeChanged, err));
						return 'auto';
					}
					// Trigger flow
					this.driver.triggerFlow(constants.flows.offAutoThermostatModeChanged, this, {}, { mode: report.Level.Mode.toLowerCase() }).catch(err => this.error('failed to trigger flow', constants.flows.offAutoThermostatModeChanged, err));
					return report.Level.Mode.toLowerCase();
				}
				return null;
			},
		});
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

		return await super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * Method that fetches the thermostat mode setting which is needed to determine if dimming is enabled or not.
	 * @returns {Promise<*>}
	 * @private
	 */
	async _getThermostatModeSetting() {
		if (typeof this.getStoreValue('thermostatMode') !== 'string') {
			const thermostatMode = await this.safeConfigurationGet(59);
			if (thermostatMode && thermostatMode.hasOwnProperty('Configuration Value')) {
				const result = thermostatMode['Configuration Value'][0] ? 'Cool' : 'Heat';
				this.setSettings({ thermostatMode: result === 'Heat' ? '0' : '1' });
				this.setStoreValue('thermostatMode', result);
				return result;
			}
			return null;
		}
		return this.getStoreValue('thermostatMode');
	}
}

module.exports = ZMNHID;
