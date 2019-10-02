'use strict';

const constants = require('../../lib/constants');
const QubinoDevice = require('../../lib/QubinoDevice');

/**
 * Smart Meter (ZMNHTD)
 * Extended manual: http://qubino.com/download/2069/
 * Regular manual: http://qubino.com/download/1093/
 * TODO: maintenance action for reset meter
 */
class ZMNHTD extends QubinoDevice {

	/**
	 * Method that registers custom setting parsers.
	 */
	registerSettings() {
		super.registerSettings();
	}

	/**
	 * Override settings migration map
	 * @private
	 */
	_settingsMigrationMap() {
		const migrationMap = {};
		if (this.getSetting('automatic_turning_off_ir_output_after_set_time') !== null) {
			migrationMap.autoOffQ1 = () => this.getSetting('automatic_turning_off_ir_output_after_set_time')
		}
		if (this.getSetting('automatic_turning_on_ir_output_after_set_time') !== null) {
			migrationMap.autoOnQ1 = () => this.getSetting('automatic_turning_on_ir_output_after_set_time')
		}
		if (this.getSetting('automatic_turning_off_relay_output_after_set_time') !== null) {
			migrationMap.autoOffQ2 = () => this.getSetting('automatic_turning_off_relay_output_after_set_time')
		}
		if (this.getSetting('automatic_turning_on_relay_output_after_set_time') !== null) {
			migrationMap.autoOnQ2 = () => this.getSetting('automatic_turning_on_relay_output_after_set_time')
		}
		if (this.getSetting('enable_disable_endpoints') !== null) {
			migrationMap.enableInput1 = () => this.getSetting('enable_disable_endpoints')
		}
		return migrationMap
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	async registerCapabilities() {

		if (this.hasCapability(constants.capabilities.onoff)) {
			this.removeCapability(constants.capabilities.onoff).catch(err => this.error(`Error removing ${constants.capabilities.onoff} capability`, err))
		}
		if (this.hasCapability(constants.capabilities.meterPower)) {
			this.removeCapability(constants.capabilities.meterPower).catch(err => this.error(`Error removing ${constants.capabilities.meterPower} capability`, err))
		}

		// Loop all current capabilities and add if necessary
		const currentCapabilities = [
			constants.capabilities.measureVoltage,
			constants.capabilities.measureCurrent,
			constants.capabilities.meterPowerImport,
			constants.capabilities.meterPowerExport,
			constants.capabilities.powerReactive,
			constants.capabilities.powerTotalReactive,
			constants.capabilities.powerTotalApparent,
			constants.capabilities.powerFactor
		];
		for (let i in currentCapabilities) {
			let currentCapability = currentCapabilities[i];
			if (!this.hasCapability(currentCapability)) {
				await this.addCapability(currentCapability).catch(err => this.error(`Error adding ${currentCapability} capability`, err))
			}
		}

		// Register capabilities
		this.registerCapability(constants.capabilities.measureVoltage, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measureCurrent, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.meterPowerImport, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.meterPowerExport, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.powerReactive, constants.commandClasses.meter); // TODO: validate this is in kVar
		this.registerCapability(constants.capabilities.powerTotalReactive, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.powerTotalApparent, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.powerFactor, constants.commandClasses.meter);
	}
}

module.exports = ZMNHTD;
