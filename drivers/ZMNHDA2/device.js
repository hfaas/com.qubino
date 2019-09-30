'use strict';

const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

const CACHED_DIM_VALUE_STORE_KEY = 'cachedDimValue';

/**
 * Flush Dimmer (ZMNHDA)
 * Manual: https://smart-telematik.se/dokument/qubino-flush-dimmer.pdf
 */
class ZMNHDA extends QubinoDimDevice {

	/**
	 * Override default multi channel configuration.
	 * @returns {boolean}
	 */
	get multiChannelConfigurationDisabled() {
		return true;
	}

	/**
	 * Expose input configuration, two possible inputs (input 2 and input 3).
	 * @returns {*[]}
	 */
	get inputConfiguration() {
		return [
			{
				id: 2,
				defaultEnabled: true,
				flowTriggers: {
					on: 'I2_on',
					off: 'I2_off',
					toggle: 'inputTwoToggled',
				},
			},
			{
				id: 3,
				defaultEnabled: true,
				flowTriggers: {
					on: 'I3_on',
					off: 'I3_off',
					toggle: 'inputThreeToggled',
				},
			},
		];
	}

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {

		// Remove deprecated capability
		if(this.hasCapability('alarm_contact')) {
			this.removeCapability('alarm_contact').catch(err => this.error('Error removing alarm_contact capability', err))
		}

		this.registerCapability(constants.capabilities.meterPower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.measurePower, constants.commandClasses.meter);
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary, {
			setParserV1: value => { // Custom parser that caches and updates dim value since device does report it itself
				const currentDimValue = this.getCapabilityValue(constants.capabilities.dim);
				if (currentDimValue > 0) {
					this.setStoreValue(CACHED_DIM_VALUE_STORE_KEY, currentDimValue).catch(this.error.bind(this));
				}
				if (!value) {
					this.setCapabilityValue(constants.capabilities.dim, 0).catch(this.error.bind(this));
				}
				else {
					const cachedDimValue = this.getStoreValue(CACHED_DIM_VALUE_STORE_KEY);
					this.setCapabilityValue(constants.capabilities.dim, cachedDimValue).catch(this.error.bind(this));
				}
				return {
					'Switch Value': (value) ? 'on/enable' : 'off/disable',
				}
			},
		});
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel, {
			reportParserV1: report => { // Custom parser that caches dim value since device does not report it itself
				if (report && report.hasOwnProperty('Value (Raw)')) {
					if (this.hasCapability('onoff')) this.setCapabilityValue('onoff', report['Value (Raw)'][0] > 0);
					if (report['Value (Raw)'][0] === 255) {
						this.setStoreValue(CACHED_DIM_VALUE_STORE_KEY, 1).catch(this.error.bind(this));
						return 1;
					}
					const returnValue = report['Value (Raw)'][0] / 99;
					this.setStoreValue(CACHED_DIM_VALUE_STORE_KEY, returnValue).catch(this.error.bind(this));
					return returnValue;
				}
				return null;
			},
		});
		this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel);
	}
}

module.exports = ZMNHDA;
