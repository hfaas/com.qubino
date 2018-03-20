'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class GenericDevice extends ZwaveDevice {
	async onMeshInit() {
		this._debug(`detected ${this.numberOfMultiChannelNodes} multi channel nodes`);
		if (this.isTemperatureSensorConnected) this._debug('detected connected temperature sensor');

		// Configure multi channel reporting if necessary
		this._configureReporting();

		// Register configuration dependent capabilities
		this._registerCapabilities();

		// Register custom setting parsers
		this._registerSettings();
	}

	/**
	 * Getter which returns the number of available multi channel nodes.
	 * @returns {number}
	 */
	get numberOfMultiChannelNodes() {
		return Object.keys(this.node.MultiChannelNodes || {}).length;
	}

	/**
	 * Getter which returns true if there is a temperature sensor is connected and vice versa.
	 * @returns {boolean}
	 */
	get isTemperatureSensorConnected() {
		return (
			this.numberOfMultiChannelNodes > 0 &&
			(
				this.node.MultiChannelNodes['2'].CommandClass.hasOwnProperty('COMMAND_CLASS_SENSOR_MULTILEVEL') ||
				this.node.MultiChannelNodes['3'].CommandClass.hasOwnProperty('COMMAND_CLASS_SENSOR_MULTILEVEL')
			)
		);
	}

	/**
	 * Method that will configure reporting in case the device has multi channel nodes and it has not been configured
	 * yet. In that case it will try to set association group 1 to '1.1` which enables multi channel node reporting.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _configureReporting() {
		if (this.numberOfMultiChannelNodes > 0 && !this.getSetting('multi_channel_reporting_configured')) {
			try {
				await this._configureMultiChannelReporting();
			} catch (err) {
				this.setUnavailable(Homey._('error.missing_multi_channel_command_class'));
			}
			this.setSettings({ multi_channel_reporting_configured: true });
		}
	}

	/**
	 * Method that will first remove any present association in group 1 and will then set association group 1 to '1.1'.
	 * @returns {Promise<boolean>}
	 * @private
	 */
	async _configureMultiChannelReporting() {
		if (this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL_ASSOCIATION) {
			if (this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL_ASSOCIATION.MULTI_CHANNEL_ASSOCIATION_SET) {
				await this.node.CommandClass.COMMAND_CLASS_ASSOCIATION.ASSOCIATION_REMOVE(new Buffer([1, 1]));
				await this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL_ASSOCIATION.MULTI_CHANNEL_ASSOCIATION_SET(
					new Buffer([1, 0x00, 1, 1])
				);
				await this.setSettings({ zw_group_1: '1.1' });
				this._debug('configured multi channel node reporting');
				return true;
			}
			throw new Error('multi_channel_association_not_supported');
		}
		throw new Error('multi_channel_association_not_supported');
	}
}

module.exports = GenericDevice;
