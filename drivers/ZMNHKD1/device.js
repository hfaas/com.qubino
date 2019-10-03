'use strict';

const constants = require('../../lib/constants');
const QubinoThermostatDevice = require('../../lib/QubinoThermostatDevice');
const MeshDriverUtil = require('homey-meshdriver').Util;

/**
 * Flush Heat & Cool Thermostat (ZMNHKD)
 * Extended manual: http://qubino.com/download/2054/
 * Regular manual: http://qubino.com/download/1071/
 * TODO: migrate capabilities
 */
class ZMNHKD extends QubinoThermostatDevice {

	/**
	 * Expose input configuration, two possible inputs (input 1 and input 2).
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

          // Trigger flow
          const newCapabilityValue = report.Level.Mode.toLowerCase();
          if (typeof preReportValue !== 'undefined' && preReportValue !== null && preReportValue !== newCapabilityValue) {
            this.driver.triggerFlow(constants.flows.offAutoThermostatModeChanged, this, {}, { mode: newCapabilityValue }).catch(err => this.error('failed to trigger flow', constants.flows.offAutoThermostatModeChanged, err));
          }
          preReportValue = newCapabilityValue;
          return newCapabilityValue;
				}
				return null;
			},
		});
	}

  /**
   * Override settings migration map
   * @private
   */
  _settingsMigrationMap() {
    const migrationMap = {};
    if (this.getSetting('input_1_status_on_delay') !== null) {
      migrationMap.statusOnDelayInput1 = () => this.getSetting('input_1_status_on_delay')
    }
    if (this.getSetting('input_2_status_on_delay') !== null) {
      migrationMap.statusOnDelayInput2 = () => this.getSetting('input_2_status_on_delay')
    }
    if (this.getSetting('input_1_status_off_delay') !== null) {
      migrationMap.statusOffDelayInput1 = () => this.getSetting('input_1_status_off_delay')
    }
    if (this.getSetting('input_2_status_off_delay') !== null) {
      migrationMap.statusOffDelayInput2 = () => this.getSetting('input_2_status_off_delay')
    }
    if (this.getSetting('input_1_functionality_selection') !== null) {
      migrationMap.functionalityInput1 = () => this.getSetting('input_1_functionality_selection')
    }
    if (this.getSetting('input_2_functionality_selection') !== null) {
      migrationMap.functionalityInput2 = () => this.getSetting('input_2_functionality_selection')
    }
    if (this.getSetting('power_report_on_power_change_q1') !== null) {
      migrationMap.powerReportingThreshold = () => this.getSetting('power_report_on_power_change_q1');
    }
    if (this.getSetting('power_report_by_time_interval_q1') !== null) {
      migrationMap.powerReportingInterval = () => this.getSetting('power_report_by_time_interval_q1');
    }
    if (this.getSetting('temperature_hysteresis_heating_on') !== null) {
      migrationMap.temperatureHeatingHysteresisOn = () => this.getSetting('temperature_hysteresis_heating_on')  / 10;
    }
    if (this.getSetting('temperature_hysteresis_heating_off') !== null) {
      migrationMap.temperatureHeatingHysteresisOff = () => this.getSetting('temperature_hysteresis_heating_off')  / 10;
    }
    if (this.getSetting('temperature_hysteresis_cooling_on') !== null) {
      migrationMap.temperatureCoolingHysteresisOn = () => this.getSetting('temperature_hysteresis_cooling_on')  / 10;
    }
    if (this.getSetting('temperature_hysteresis_cooling_off') !== null) {
      migrationMap.temperatureCoolingHysteresisOff = () => this.getSetting('temperature_hysteresis_cooling_off')  / 10;
    }
    if (this.getSetting(constants.settings.antifreezeEnabled) !== null) {
      migrationMap.antifreezeEnabled = () => {
        let currentValue = this.getSetting('antifreeze');
        if (currentValue !== 255) return true;
        return false;
      }
    }
    if (this.getSetting('antifreeze') !== null) {
      migrationMap.antifreeze = () => {
        let currentValue = this.getSetting('antifreeze');
        if (currentValue === 255) return 0;
        if (currentValue >= 0 && currentValue <= 127) return MeshDriverUtil.mapValueRange(0, 127, 0.1, 12.7, currentValue);
        return 0;
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
    if (this.getSetting('output_switch_selection_q1 ') !== null) { // Yes these spaces are needed..
      migrationMap.relayTypeQ1 = () => this.getSetting('output_switch_selection_q1 ');
    }
    if (this.getSetting('output_switch_selection_q2 ') !== null) {  // Yes these spaces are needed..
      migrationMap.relayTypeQ2 = () => this.getSetting('output_switch_selection_q2 ');
    }

    return migrationMap;
  }

  /**
   * Method that registers custom setting parsers.
   */
	registerSettings() {
	  super.registerSettings();

    this.registerSetting(constants.settings.temperatureHeatingHysteresisOn, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.7, 1001, 1127, value); // different; -12.7 - +12.7
    });

    this.registerSetting(constants.settings.temperatureHeatingHysteresisOff, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.7, 1001, 1127, value); // different; -12.7 - +12.7
    });

    this.registerSetting(constants.settings.temperatureCoolingHysteresisOn, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.7, 1001, 1127, value); // different; -12.7 - +12.7
    });

    this.registerSetting(constants.settings.temperatureCoolingHysteresisOff, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.7, 1001, 1127, value); // different; -12.7 - +12.7
    });

    this.registerSetting(constants.settings.antifreeze, value => {
      if (!value || value === 255) return value;
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.6, 1001, 1127, value); // different; to 1127
    });
  }
}

module.exports = ZMNHKD;
