'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Flush 2 Relay (ZMNHBD)
 * Extended manual: http://qubino.com/download/2044/
 * Regular manual: http://qubino.com/download/1029/
 * TODO: add maintenance action for meter reset (both endpoints)
 */
class ZMNHBD extends QubinoDevice {

	/**
	 * Override settings migration map
	 * @private
	 */
	_settingsMigrationMap() {
		const migrationMap = {};
		if (this.getSetting('automatic_turning_off_output_q1_after_set_time') !== null) {
			migrationMap.autoOffQ1 = () => this.getSetting('automatic_turning_off_output_q1_after_set_time')
		}
		if (this.getSetting('automatic_turning_off_output_q2_after_set_time') !== null) {
			migrationMap.autoOffQ2 = () => this.getSetting('automatic_turning_off_output_q2_after_set_time')
		}
		if (this.getSetting('automatic_turning_on_output_q1_after_set_time') !== null) {
			migrationMap.autoOnQ1 = () => this.getSetting('automatic_turning_on_output_q1_after_set_time')
		}
		if (this.getSetting('automatic_turning_on_output_q2_after_set_time') !== null) {
			migrationMap.autoOnQ2 = () => this.getSetting('automatic_turning_on_output_q2_after_set_time')
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
		if (this.getSetting('output_switch_selection_q1 ') !== null) { // Yes these spaces are needed..
			migrationMap.relayTypeQ1 = () => this.getSetting('output_switch_selection_q1 ');
		}
		if (this.getSetting('output_switch_selection_q2 ') !== null) {
			migrationMap.relayTypeQ2 = () => this.getSetting('output_switch_selection_q2 ');
		}
		return migrationMap;
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	async registerCapabilities() {

		if (!this._isRootNode()) {
			this.log('migrate capabilities for multi channel nodes')
			if (!this.hasCapability(constants.capabilities.meterPower)) {
				await this.addCapability(constants.capabilities.meterPower).catch(err => this.error(`Error adding ${constants.capabilities.meterPower} capability`, err))
			}
			if (!this.hasCapability(constants.capabilities.measurePower)) {
				await this.addCapability(constants.capabilities.measurePower).catch(err => this.error(`Error adding ${constants.capabilities.measurePower} capability`, err))
			}
		} else {
			this.log('migrate capabilities for root nodes')
			if (this.hasCapability(constants.capabilities.onoff)) { // TODO: this breaks Flows notify users
				await this.removeCapability(constants.capabilities.onoff).catch(err => this.error(`Error removing ${constants.capabilities.onoff} capability`, err))
			}
			if (this.hasCapability(constants.capabilities.meterPower)) { // TODO: this breaks Flows notify users
				await this.removeCapability(constants.capabilities.meterPower).catch(err => this.error(`Error removing ${constants.capabilities.meterPower} capability`, err))
			}
			if (this.hasCapability(constants.capabilities.measurePower)) { // TODO: this breaks Flows notify users
				await this.removeCapability(constants.capabilities.measurePower).catch(err => this.error(`Error removing ${constants.capabilities.measurePower} capability`, err))
			}
			if (!this.hasCapability(constants.capabilities.allOn)) {
				await this.addCapability(constants.capabilities.allOn).catch(err => this.error(`Error adding ${constants.capabilities.allOn} capability`, err))
			}
			if (!this.hasCapability(constants.capabilities.allOff)) {
				await this.addCapability(constants.capabilities.allOff).catch(err => this.error(`Error adding ${constants.capabilities.allOff} capability`, err))
			}
		}

		if (this.hasCapability(constants.capabilities.allOn)) this.registerCapabilityListener(constants.capabilities.allOn, this.turnAllOn.bind(this));
		if (this.hasCapability(constants.capabilities.allOff)) this.registerCapabilityListener(constants.capabilities.allOff, this.turnAllOff.bind(this));
		if (this.hasCapability(constants.capabilities.meterPower)) this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		if (this.hasCapability(constants.capabilities.measurePower)) this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		if (this.hasCapability(constants.capabilities.onoff)) this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		if (this.hasCapability(constants.capabilities.measureTemperature)) this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel, constants.multiChannelNodeIdThree);

	}

	_isRootNode() {
		return Object.prototype.hasOwnProperty.call(this.node, 'MultiChannelNodes') && Object.keys(this.node.MultiChannelNodes).length > 0;
	}

	/**
	 * Method that sends a SWITCH_BINARY command to turn the device on.
	 * @returns {Promise<*>}
	 */
	async turnAllOn() {
		if (this.hasCommandClass(constants.commandClasses.switchBinary)) {
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchBinary}`].SWITCH_BINARY_SET({ 'Switch Value': 'on/enable' });
		}
		return Promise.reject(new Error('device_does_not_support_switch_binary'));
	}

	/**
	 * Method that sends a SWITCH_BINARY command to turn the device off.
	 * @returns {Promise<*>}
	 */
	async turnAllOff() {
		if (this.hasCommandClass(constants.commandClasses.switchBinary)) {
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchBinary}`].SWITCH_BINARY_SET({ 'Switch Value': 'off/disable' });
		}
		return Promise.reject(new Error('device_does_not_support_switch_binary'));
	}
}

module.exports = ZMNHBD;
