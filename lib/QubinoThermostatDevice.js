'use strict';

const Homey = require('homey');

const constants = require('./constants');
const QubinoDevice = require('./QubinoDevice');

/**
 * This class adds basic functionality related Qubino devices supporting dimming (mostly lights), it handles setting
 * min/max dimming values.
 */
class QubinoThermostatDevice extends QubinoDevice {

	/**
	 * Wrapper for execute capability set command from Flow card.
	 * @param value - mode ['auto'/'off']
	 * @returns {Promise<string|*>}
	 */
	setThermostatMode(value) {
		return this.executeCapabilitySetCommand(constants.capabilities.offAutoThermostatMode, constants.commandClasses.thermostatMode, value);
	}
}

module.exports = QubinoThermostatDevice;
