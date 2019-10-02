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
	registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.targetTemperature, constants.commandClasses.thermostatSetpoint);
		let preReportValue = null;
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
   * Method that registers custom setting parsers.
   */
	registerSettings() {
	  super.registerSettings();

    this.registerSetting(constants.settings.antifreeze, value => {
      if (!value || value === 255) return value;
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.6, 1001, 1127, value); // different; to 1127
    });
  }
}

module.exports = ZMNHKD;
