'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const MeshDriverUtil = require('homey-meshdriver').Util;

const constants = require('./constants');
const RETRY_GET_CONFIG = 3;

/**
 * This class adds basic functionality related to most if not all Qubino devices, it detects the devices
 * multi channel endpoint structure, configures its multi channel association reporting accordingly and handles some
 * very common settings.
 */
class QubinoDevice extends ZwaveDevice {
	async onMeshInit() {
		this.printNode();

		// Register common settings
		this.registerSettings();

		this._inputs = {};

		// Get number of multi channel nodes
		this.numberOfMultiChannelNodes = Object.keys(this.node.MultiChannelNodes || {}).length;

		// Detect temperature sensor
		this.temperatureSensorEnabled = typeof this.findTemperatureSensorEndpoint() === 'number';

		// Detect inputs (only if devices has enable input 2/3 settings
		const settings = this.getSettings();
		this.inputTwoEnabled = settings.hasOwnProperty('enableInput2') ? null : false;
		this.inputThreeEnabled = settings.hasOwnProperty('enableInput3') ? null : false;

		const storedInputTwoValue = this.getStoreValue('inputTwoEnabled');
		if (storedInputTwoValue === false || storedInputTwoValue === true) this.inputTwoEnabled = storedInputTwoValue;

		const storedInputThreeValue = this.getStoreValue('inputThreeEnabled');
		if (storedInputThreeValue === false || storedInputThreeValue === true) this.inputThreeEnabled = storedInputThreeValue;

		this.log('inputTwoEnabled value', this.inputTwoEnabled);
		this.log('inputThreeEnabled value', this.inputThreeEnabled);

		// Reset power meter values on button press
		if (this.hasCapability('resetMeter')) {
			this.registerCapabilityListener('resetMeter', this.resetMeter.bind(this));
		}

		this._printQubinoDevice();

		// Get reference to driver
		this.driver = this.getDriver();

		// Only perform multi channel configuration on supported devices
		if (!this.multiChannelConfigurationDisabled) {

			// Configure multi channel reporting if necessary
			try {
				await this._configureReporting();
			} catch (err) {
				this.error('failed to configure reporting', err);
			}
		}
	}

	/**
	 * Method that resets the accumulated power meter value on the node. It tries to find the root node of the device
	 * and then looks for the COMMAND_CLASS_METER.
	 * @returns {*}
	 */
	resetMeter() {
		const multiChannelRootNodeId = this.findRootDeviceEndpoint();
		const commandClassMeter = this.getCommandClass(constants.commandClasses.meter, multiChannelRootNodeId);
		if (commandClassMeter && commandClassMeter.hasOwnProperty(constants.commandClasses.commands.meterReset)) {
			return new Promise((resolve, reject) => {
				commandClassMeter[constants.commandClasses.commands.meterReset]({}, (err, result) => {
					if (err || result !== 'TRANSMIT_COMPLETE_OK') return reject(err || result);
					return resolve();
				});
			});
		}
		return Promise.reject(new Error('missing_meter_reset_command'));
	}

	registerTemperatureSensorEndpoint() {

		// Register thermostat endpoint
		const temperatureSensorEndpoint = this.findTemperatureSensorEndpoint();
		if (typeof temperatureSensorEndpoint === 'number') {
			this.log('Configured temperature sensor on multi channel node', temperatureSensorEndpoint);
			this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel, {
				multiChannelNodeId: temperatureSensorEndpoint,
			});
		}
	}

	get multiChannelConfigurationDisabled() {
		return false;
	}

	_printQubinoDevice() {
		this.log('Device configuration:');
		this.log('- Multi channel configuration', this.multiChannelConfigurationDisabled ? 'disabled' : 'enabled');
		this.log('- Temperature sensor:', this.temperatureSensorEnabled ? 'connected' : 'not connected');
		this.log('- MultiChannelNodes:', this.numberOfMultiChannelNodes);

		if (this.numberOfMultiChannelNodes > 0) {
			for (let i = 1; i <= this.numberOfMultiChannelNodes; i++) {
				this.log(`-- MultiChannelNode ${i}:`);
				this.log(`-- Generic device class: ${this.node.MultiChannelNodes[i].deviceClassGeneric}`);
				for (const j in this.node.MultiChannelNodes[i].CommandClass) {
					this.log('---', j);
				}
			}
		}
	}

	/**
	 * When settings have been changed that change the device structure notify the user of requirement to re-pair.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {{en: string, nl: string}}
	 */
	customSaveMessage(oldSettings, newSettings, changedKeysArr = []) {
		if (changedKeysArr.includes(constants.settings.enableInput2) || changedKeysArr.includes(constants.settings.enableInput3)) {
			return Homey.__('settings.re_pair_required');
		}
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return an array with the multi channel node ids
	 * of the found input sensor endpoints.
	 * @returns {Array}
	 */
	findInputSensorEndpoints() {
		const foundEndpoints = [];
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.sensorBinary ||
				this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.sensorNotification) {
				foundEndpoints.push(Number(i));
			}
		}
		return foundEndpoints;
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return the multi channel node id of the found
	 * endpoint that supports the temperature sensor.
	 * @returns {*}
	 */
	findTemperatureSensorEndpoint() {
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.sensorMultilevel) {
				return Number(i);
			}
		}
		return null;
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return the multi channel node id of the found
	 * endpoint that supports the basic device controls.
	 * TODO: move this configuration to the device.js
	 * @returns {*}
	 */
	findRootDeviceEndpoint() {
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.switchBinary ||
				this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.switchMultilevel) {
				return Number(i);
			}
		}
		return null;
	}

	/**
	 * Method that registers input handlers. It retrieves the parameters 100 and 101 to see which input is enabled, then
	 * it binds listeners on the correct endpoints for the correct inputs.
	 * @returns {Promise<void>}
	 */
	async registerInputEndpoints() {
		this.log('registerInputEndpoints()');
		// Register input endpoints
		const inputSensorEndpoints = this.findInputSensorEndpoints();
		this.log('registerInputEndpoints() -> found endpoints', inputSensorEndpoints);
		const getUnknownInputs = [];

		// Detect inputs
		if (this.inputTwoEnabled === null) getUnknownInputs.push(this.getInputTwoStatus());
		if (this.inputThreeEnabled === null) getUnknownInputs.push(this.getInputThreeStatus());
		await Promise.all(getUnknownInputs);

		if (Array.isArray(inputSensorEndpoints) && inputSensorEndpoints.length > 0) {
			if (inputSensorEndpoints.length === 1) {
				if (this.inputTwoEnabled === true) {
					this.registerInputEndpointListener(inputSensorEndpoints[0], 2);
				} else if (this.inputTwoEnabled === false) {
					this.registerInputEndpointListener(inputSensorEndpoints[0], 3);
				}
			} else {
				inputSensorEndpoints.forEach(inputSensorEndpoint => {
					this.registerInputEndpointListener(inputSensorEndpoint, inputSensorEndpoint);
				});
			}
		}
	}

	/**
	 * Method that registers a multi channel report listener for the specified endpoint and corresponding input.
	 * @param inputSensorEndpoint
	 * @param inputId
	 */
	registerInputEndpointListener(inputSensorEndpoint, inputId) {
		this.log(`Configured input sensor ${inputId} on multi channel node ${inputSensorEndpoint}`);

		this._inputs[inputSensorEndpoint] = constants.inputMap[inputId];

		this.registerMultiChannelReportListener(
			inputSensorEndpoint,
			constants.commandClasses.sensorBinary,
			constants.commandClasses.sensorBinaryReport,
			(...args) => this.processInputEvent(inputSensorEndpoint, ...args));

		this.registerMultiChannelReportListener(
			inputSensorEndpoint,
			constants.commandClasses.notification,
			constants.commandClasses.notificationReport,
			(...args) => this.processInputEvent(inputSensorEndpoint, ...args));
	}

	/**
	 * Method that gets a parameter from the device to determine if input 2 is enabled.
	 * @returns {Promise<boolean>}
	 * @private
	 */
	async getInputTwoStatus() {
		this.log('getInputTwoStatus()');

		let result;
		for (let i = 0; i < RETRY_GET_CONFIG; ++i) {
			try {
				result = await this.configurationGet({ index: 100 });
				break;
			} catch (err) {
				// retry
			}
		}
		if (!result) {
			this.error('failed to get configuration parameter 100');
			return null;
		}

		if (result && result['Configuration Value'] && result['Configuration Value'][0] >= 1 &&
			result['Configuration Value'][0] <= 6 || result['Configuration Value'][0] === 9) {
			this.setStoreValue('inputTwoEnabled', true);
			this.inputTwoEnabled = true;
			this.setSettings({ enableInput2: result['Configuration Value'][0].toString() });
			return true;
		}
		this.setStoreValue('inputTwoEnabled', false);
		this.inputTwoEnabled = false;
		this.setSettings({ enableInput2: '0' });
		return false;
	}

	/**
	 * Method that gets a parameter from the device to determine if input 3 is enabled.
	 * @returns {Promise<boolean>}
	 * @private
	 */
	async getInputThreeStatus() {
		this.log('getInputThreeStatus()');

		let result;
		for (let i = 0; i < RETRY_GET_CONFIG; ++i) {
			try {
				result = await this.configurationGet({ index: 101 });
				break;
			} catch (err) {
				// retry
			}
		}
		if (!result) {
			this.error('failed to get configuration parameter 101');
			return null;
		}
		if (result && result['Configuration Value'] && result['Configuration Value'][0] >= 1 &&
			result['Configuration Value'][0] <= 6 || result['Configuration Value'][0] === 9) {
			this.setStoreValue('inputThreeEnabled', true);
			this.inputThreeEnabled = true;
			this.setSettings({ enableInput3: result['Configuration Value'][0].toString() });
			return true;
		}
		this.setStoreValue('inputThreeEnabled', false);
		this.inputThreeEnabled = false;
		this.setSettings({ enableInput3: '0' });
		return false;
	}

	/**
	 * Method that processes a notification report and triggers the corresponding Flow.
	 * @param inputSensorEndpoint
	 * @param report
	 * @private
	 */
	processInputEvent(inputSensorEndpoint, report) {
		if (!inputSensorEndpoint) throw new Error('missing_input_sensor_endpoint');
		if (!report || (!report.hasOwnProperty('Event (Parsed)') && !report.hasOwnProperty('Sensor Value'))) return;
		let newState = null;

		// Determine new state from sensor binary report or notification report
		if (report.hasOwnProperty('Sensor Value')) {
			newState = (report['Sensor Value'] === 'detected an event');
		} else if (report.hasOwnProperty('Event (Parsed)')) {
			newState = (report['Event (Parsed)'] !== 'Event inactive');
		}
		if (newState === null) return;

		// Get input object
		const inputObj = this._inputs[inputSensorEndpoint];
		if (!inputObj) throw new Error(`unknown_input_sensor_endpoint_${inputSensorEndpoint}`);
		if (inputObj.state === newState) return; // Do nothing when state did not change
		inputObj.state = newState;

		this.log(`Received notification from input ${inputObj.inputId}: ${newState}`);

		// Always trigger toggle
		this.driver.triggerFlow(inputObj.flowTriggers.toggle, this);

		// Trigger flow based on state
		if (newState) {
			this.driver.triggerFlow(inputObj.flowTriggers.on, this);
		} else {
			this.driver.triggerFlow(inputObj.flowTriggers.off, this);
		}
	}

	/**
	 * Override onSettings to handle combined z-wave settings.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {Promise<T>}
	 */
	async onSettings(oldSettings, newSettings, changedKeysArr) {

		// Handle all on/all off settings
		if (changedKeysArr.includes(constants.settings.allOn) || changedKeysArr.includes(constants.settings.allOff)) {
			const allOnAllOf = QubinoDevice._combineAllOnAllOffSettings(newSettings);
			const allOnAllOfSize = this.allOnAllOffSize || constants.settings.size.allOnAllOff;
			await this.configurationSet({
				index: constants.settings.index.allOnAllOff,
				size: allOnAllOfSize,
				signed: allOnAllOfSize !== 1,
			}, allOnAllOf);

			// Remove all on all off changed keys
			changedKeysArr = [...changedKeysArr.filter(changedKey => changedKey !== constants.settings.allOn && changedKey !== constants.settings.allOff)];
		}

		return super.onSettings(oldSettings, newSettings, changedKeysArr);
	}

	/**
	 * Combine two settings (all on/all off) into one value.
	 * @param newSettings
	 * @returns {number}
	 * @private
	 */
	static _combineAllOnAllOffSettings(newSettings) {
		const allOn = newSettings[constants.settings.allOn];
		const allOff = newSettings[constants.settings.allOff];
		if (allOn && allOff) return 255;
		else if (allOn && !allOff) return 2;
		else if (!allOn && allOff) return 1;
		return 0;
	}

	/**
	 * Method that will configure reporting in case the device has multi channel nodes and it has not been configured
	 * yet. In that case it will try to set association group 1 to '1.1` which enables multi channel node reporting.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _configureReporting() {
		if (this.numberOfMultiChannelNodes > 0 && !this.getSetting(constants.settings.multiChannelReportingConfigured)) {
			try {
				await this._configureMultiChannelReporting();
			} catch (err) {
				this.error('Failed configure reporting', err);
				this.setUnavailable(Homey.__('error.missing_multi_channel_command_class'));
			}
			this.setSettings({ [constants.settings.multiChannelReportingConfigured]: true });
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
		}
		throw new Error('multi_channel_association_not_supported');
	}

	/**
	 * Method that handles the parsing of many shared settings.
	 */
	registerSettings() {

		// Invert restore status value
		this.registerSetting(constants.settings.restoreStatus, value => !value);

		// Multiply temperature sensor threshold by 10
		this.registerSetting(constants.settings.temperatureSensorReportingThreshold, value => value * 10);

		// Map temperature calibration value
		this.registerSetting(constants.settings.temperatureSensorOffset, value => {
			if (value === 0) return 32536;

			// -10 till -0.1 becomes 1100 till 1001
			if (value < 0) return MeshDriverUtil.mapValueRange(-10, -0.1, 1100, 1001, value);

			// 10 till 0.1 becomes 100 till 1
			return MeshDriverUtil.mapValueRange(10, 0.1, 100, 1, value);
		});
	}
}

module.exports = QubinoDevice;
