'use strict';

const constants = require('../../lib/constants');
const QubinoThermostatDevice = require('../../lib/QubinoThermostatDevice');
const MeshDriverUtil = require('homey-meshdriver').Util;

/**
 * Flush On/Off Thermostat (ZMNHIA)
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
   * Override settings migration map
   * @private
   */
  _settingsMigrationMap() {
    const migrationMap = {};

    if (this.getSetting(constants.settings.setpointInput2Enabled) !== null) {
      migrationMap.setpointInput2Enabled = () => {
        let currentValue = this.getSetting('input_2_set_point');
        if (currentValue !== 65535) return true
        return false;
      }
    }
    if (this.getSetting('input_2_set_point') !== null) {
      migrationMap.setpointInput2 = () => {
        let currentValue = this.getSetting('input_2_set_point');
        if (currentValue === 65535) return 20;
        if (currentValue <= 990) {
          return currentValue / 10;
        }
        if (currentValue >= 1001) {
          return MeshDriverUtil.mapValueRange(1001, 1150, 0.1, 15.0, currentValue) * -1;
        }
      }
    }
    if (this.getSetting(constants.settings.setpointInput3Enabled) !== null) {
      migrationMap.setpointInput3Enabled = () => {
        let currentValue = this.getSetting('input_3_set_point');
        if (currentValue !== 65535) return true
        return false;
      }
    }
    if (this.getSetting('input_3_set_point') !== null) {
      migrationMap.setpointInput3 = () => {
        let currentValue = this.getSetting('input_3_set_point');
        if (currentValue === 65535) return 20;
        if (currentValue <= 990) {
          return currentValue / 10;
        }
        if (currentValue >= 1001) {
          return MeshDriverUtil.mapValueRange(1001, 1150, 0.1, 15.0, currentValue) * -1;
        }
      }
    }
    if (this.getSetting('power_report_by_time_interval') !== null) {
      migrationMap.powerReportingInterval = () => this.getSetting('power_report_by_time_interval');
    }
    if (this.getSetting('temperature_hysteresis_on') !== null) {
      migrationMap.temperatureHysteresisOn = () => {
        let currentValue = this.getSetting('temperature_hysteresis_on');
        if (currentValue >= 128) return MeshDriverUtil.mapValueRange(128, 255, 0.1, 12.7, currentValue) * -1;
        return currentValue / 10;
      }
    }
    if (this.getSetting('temperature_hysteresis_off') !== null) {
      migrationMap.temperatureHysteresisOff = () => {
        let currentValue = this.getSetting('temperature_hysteresis_off');
        if (currentValue >= 128) return MeshDriverUtil.mapValueRange(128, 255, 0.1, 12.7, currentValue) * -1;
        return currentValue / 10;
      }
    }
    if (this.getSetting(constants.settings.antifreezeEnabled) !== null) {
      migrationMap.antifreezeEnabled = () => {
        let currentValue = this.getSetting('antifreeze');
        if (currentValue !== 255) return true
        return false;
      }
    }
    if (this.getSetting('antifreeze') !== null) {
      migrationMap.antifreeze = () => {
        let currentValue = this.getSetting('antifreeze');
        if (currentValue === 255) return 0;
        if (currentValue >= 128) return MeshDriverUtil.mapValueRange(128, 254, 0.1, 12.6, currentValue) * -1;
        return currentValue / 10;
      }
    }
    if (this.getSetting('too_low_temperature_limit')) {
      migrationMap.tooLowTemperatureLimit = () => {
        return this.getSetting('too_low_temperature_limit') / 10;
      }
    }
    if (this.getSetting('too_high_temperature_limit')) {
      migrationMap.tooHighTemperatureLimit = () => {
        return this.getSetting('too_high_temperature_limit') / 10;
      }
    }
    if (this.getSetting('output_switch_selection') !== null) {
      migrationMap.relayType = () => this.getSetting('output_switch_selection');
    }
    return migrationMap
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
  }

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	async registerCapabilities() {

	  // Migrate capabilities
	  if (this.hasCapability('custom_thermostat_mode')) {
      await this.removeCapability('custom_thermostat_mode').catch(err => this.error('Error removing custom_thermostat_mode capability', err))
    }
    if (!this.hasCapability(constants.capabilities.meterPower)) {
      await this.addCapability(constants.capabilities.meterPower).catch(err => this.error(`Error adding ${constants.capabilities.meterPower} capability`, err))
    }
    if (!this.hasCapability(constants.capabilities.measurePower)) {
      await this.addCapability(constants.capabilities.measurePower).catch(err => this.error(`Error adding ${constants.capabilities.measurePower} capability`, err))
    }
    if (!this.hasCapability(constants.capabilities.offAutoThermostatMode)) {
      await this.addCapability(constants.capabilities.offAutoThermostatMode).catch(err => this.error(`Error adding ${constants.capabilities.offAutoThermostatMode} capability`, err))
    }

		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel);
		this.registerCapability(constants.capabilities.targetTemperature, constants.commandClasses.thermostatSetpoint);

		let preReportValue = this.getCapabilityValue(constants.capabilities.offAutoThermostatMode);
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

					// Trigger flow and check if value actually changed
          const newCapabilityValue = report.Level.Mode.toLowerCase();
          if (typeof preReportValue !== 'undefined' && preReportValue !== null && preReportValue !== newCapabilityValue) {
            this.driver.triggerFlow(constants.flows.offAutoThermostatModeChanged, this, {}, { mode: newCapabilityValue }).catch(err => this.error('failed to trigger flow', constants.flows.offAutoThermostatModeChanged, err));
          }

          // Update pre report value
          preReportValue = newCapabilityValue;

					return newCapabilityValue;
				}
				return null;
			},
		});
	}
}

module.exports = ZMNHIA;
