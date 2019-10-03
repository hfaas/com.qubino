'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 2 Relay (ZMNHBA)
 * Manual: http://www.benext.eu/static/manual/qubino/flush-2-relays-ZMNHBA2.pdf
 */
class ZMNHBA extends QubinoDevice {

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
	 * Override settings migration map
	 * @private
	 */
	_settingsMigrationMap() {
		const migrationMap = {};
		if (this.getSetting('automatic_turning_off_output_q1_after_set_time') !== null) {
			migrationMap.autoOffQ1 = () => this.getSetting('automatic_turning_off_output_q1_after_set_time') / 100
		}
		if (this.getSetting('automatic_turning_off_output_q2_after_set_time') !== null) {
			migrationMap.autoOffQ2 = () => this.getSetting('automatic_turning_off_output_q2_after_set_time') / 100
		}
		if (this.getSetting('power_report_on_power_change_q1') !== null) {
			migrationMap.powerReportingThresholdQ1 = () => this.getSetting('power_report_on_power_change_q1');
		}
		if (this.getSetting('power_report_on_power_change_q2') !== null) {
			migrationMap.powerReportingThresholdQ2 = () => this.getSetting('power_report_on_power_change_q2');
		}
		if (this.getSetting('power_report_by_time_interval_q1') !== null) {
			migrationMap.powerReportingIntervalQ1 = () => this.getSetting('power_report_by_time_interval_q1');
		}
		if (this.getSetting('power_report_by_time_interval_q2') !== null) {
			migrationMap.powerReportingIntervalQ2 = () => this.getSetting('power_report_by_time_interval_q2');
		}

		return migrationMap
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
	}

	/**
	 * Method that will register custom setting parsers for this device.
	 */
	registerSettings() {
		super.registerSettings();
		this.registerSetting(constants.settings.autoOffQ1, value => value * 100);
		this.registerSetting(constants.settings.autoOffQ2, value => value * 100);
	}
}

module.exports = ZMNHBA;
