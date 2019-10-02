'use strict';

const constants = require('../../lib/constants');
const QubinoThermostatDevice = require('../../lib/QubinoThermostatDevice');
const MeshDriverUtil = require('homey-meshdriver').Util;

/**
 * Flush On/Off Thermostat (ZMNHLD)
 * Extended manual: http://qubino.com/download/2060/
 * Regular manual: http://qubino.com/download/1084/
 *
 * Note: this device sends NOTIFICATION_REPORTS but does not advertise this as a support command class in its NIF.
 * Therefore, the settings enableInput1/enableInput2/enableInput3 can only accept value 9 SENSOR_BINARY_REPORT.
 */
class ZMNHLD extends QubinoThermostatDevice {

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
    let preReportValue = null;
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
            const newCapabilityValue = 'auto';
            if (typeof preReportValue !== 'undefined' && preReportValue !== null && preReportValue !== newCapabilityValue) {
              this.driver.triggerFlow(constants.flows.offAutoThermostatModeChanged, this, {}, { mode: newCapabilityValue }).catch(err => this.error('failed to trigger flow', constants.flows.offAutoThermostatModeChanged, err));
            }
            preReportValue = newCapabilityValue;
            return newCapabilityValue;
					}

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

module.exports = ZMNHLD;
