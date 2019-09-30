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
		this.setUnavailable(Homey.__('pairing.configuring'));

		// TODO: remove sometime in favor of maintenance action
		// Migration steps
		if (this.hasCapability('resetMeter')) {
			this.removeCapability('resetMeter');
		}
		if (this.hasCapability('calibration')) {
			this.removeCapability('calibration');
		}

		this.printNode();

		// Register common settings
		this.registerSettings();

		// After settings are registered perform migration if necessary
		const isMigrated = this.getStoreValue('migratedSettings');
		this.log('Is migrated:', isMigrated, typeof this._migrateSettings);
		if (!isMigrated && typeof this._migrateSettings === 'function') {
			this._migrateSettings(this.getSettings());
			this.setStoreValue('migratedSettings', true);
		}

		this._inputs = {};

		// Get number of multi channel nodes
		this.numberOfMultiChannelNodes = Object.keys(this.node.MultiChannelNodes || {}).length;

		// Detect temperature sensor
		this.temperatureSensorEnabled = typeof this.findTemperatureSensorEndpoint() === 'number';

		this.log('MultiChannelNodes:', this.numberOfMultiChannelNodes);
		this.log('MultiChannelConfiguration:', this.multiChannelConfigurationDisabled ? 'disabled' : 'enabled');
		this.log('TemperatureSensor:', this.temperatureSensorEnabled ? 'connected' : 'not connected');

		// Reset power meter values on button press
		if (this.hasCapability('resetMeter')) this.registerCapabilityListener('resetMeter', this.resetMeter.bind(this));

		// Get reference to driver
		this.driver = this.getDriver();

		// Configure multi channel reporting if necessary
		if (!this.multiChannelConfigurationDisabled) {
			try {
				await this._configureReporting();
			} catch (err) {
				this.error('failed to configure reporting', err);
			}
		}

		// Register configuration dependent capabilities
		await this.registerCapabilities();

		// Register temperature sensor endpoint
		this.registerTemperatureSensorEndpoint();

		// Register input endpoints
		await this.registerInputs();

		// Finally device is ready to be used, mark as available
		this.setAvailable();
	}

	_migrateSettingOneOnOne(oldSettingKey, newSettingKey) {
		const obj = {};
		obj[newSettingKey] = this.getSetting(oldSettingKey);
		this.setSettings(obj);
	}

	_migrateAllOnAllOff(key, newKeyOn, newKeyOff) {
		const value = this.getSetting(key);
		const settingsObj = {};
		this.log(`migrate setting ${key}`);
		switch (Number(value)) {
			case 255:
				settingsObj[newKeyOn] = true;
				settingsObj[newKeyOff] = true;
				break;
			case 0:
				settingsObj[newKeyOn] = false;
				settingsObj[newKeyOff] = false;
				break;
			case 1:
				settingsObj[newKeyOn] = false;
				settingsObj[newKeyOff] = true;
				break;
			case 2:
				settingsObj[newKeyOn] = true;
				settingsObj[newKeyOff] = false;
				break;
			default:
				this.error('Failed to migrated all on/all off setting');
		}
		this.setSettings(settingsObj);
	}

	/**
	 * This is a map of often used settings and migrations.
	 * @returns {{switchTypeInput1: *, switchTypeInput2: *, contactTypeInput2: *, contactTypeInput3: *, autoOn: number, autoOff: number, restoreStatus: boolean, powerReportingThreshold: *, powerReportingInterval: number, maximumDimValue: *, minimumDimValue: *, dimDuration: number, dimDurationKeyPressed: *}}
	 * @private
	 */
	_genericMigrationMap() {
		const migrationMap = {}
		if (this.getSetting('power_report_on_power_change') !== null) {
			migrationMap.powerReportingThreshold = () => this.getSetting('power_report_on_power_change');
		}
		if (this.getSetting('input_1_type') !== null) {
			migrationMap.switchTypeInput1 = () => this.getSetting('input_1_type');
		}
		if (this.getSetting('input_2_type') !== null) {
			migrationMap.switchTypeInput2 = () => this.getSetting('input_2_type');
		}
		if (this.getSetting('input_2_contact_type') !== null) {
			migrationMap.contactTypeInput2 = () => this.getSetting('input_2_contact_type');
		}
		if (this.getSetting('input_3_contact_type') !== null) {
			migrationMap.contactTypeInput3 = () => this.getSetting('input_3_contact_type');
		}
		if (this.getSetting('automatic_turning_on_output_after_set_time') !== null) {
			migrationMap.autoOn = () => Math.min(this.getSetting('automatic_turning_on_output_after_set_time'), 32535)
		}
		if (this.getSetting('automatic_turning_off_output_after_set_time') !== null) {
			migrationMap.autoOff = () => Math.min(this.getSetting('automatic_turning_off_output_after_set_time'), 32535)
		}
		if (this.getSetting('state_of_device_after_power_failure') !== null) {
			migrationMap.restoreStatus = () => !this.getSetting('state_of_device_after_power_failure')
		}
		if (this.getSetting('power_report_by_time_interval') !== null) {
			migrationMap.powerReportingInterval = () => Math.min(this.getSetting('power_report_by_time_interval'), 32535);
		}
		if (this.getSetting('maximum_dimming_value') !== null) {
			migrationMap.maximumDimValue = () => this.getSetting('maximum_dimming_value');
		}
		if (this.getSetting('minimum_dimming_value') !== null) {
			migrationMap.minimumDimValue = () => this.getSetting('minimum_dimming_value');
		}
		if (this.getSetting('dimming_time_soft_on_off') !== null) {
			migrationMap.dimDuration = () => Math.max(Math.min(this.getSetting('dimming_time_soft_on_off') / 100, 2.5), 0.5)
		}
		if (this.getSetting('dimming_time_when_key_pressed') !== null) {
			migrationMap.dimDurationKeyPressed = () => this.getSetting('dimming_time_when_key_pressed');
		}
		if (this.getSetting('temperature_sensor_offset') !== null) {
			migrationMap.temperatureSensorOffset = () => {
				const value = this.getSetting('temperature_sensor_offset');
				if (value === 32536) return 0;
				if (value >= 1 && value <= 100) {
					return MeshDriverUtil.mapValueRange(1, 100, 0.1, 10, value);
				}
				if (value >= 1001) {
					return MeshDriverUtil.mapValueRange(1001, 1100, 0.1, 10, value) * -1;
				}
			}
		}
		if (this.getSetting('digital_temperature_sensor_reporting') !== null) {
			migrationMap.temperatureSensorReportingThreshold = () => this.getSetting('digital_temperature_sensor_reporting') / 10
		}
		return migrationMap;
	}

	/**
	 * Method that gets the generic migration map and the device specific migration map if possible. Then applies migrations
	 * based on the settings keys available in the device (as described in app.json manifest).
	 * @private
	 */
	_migrateSettings() {

		// Get generic settings migration map
		const genericSettingsMigrationMap = this._genericMigrationMap();

		// Get device specific settings migration map
		const deviceSpecificSettingsMigrationMap = typeof this._settingsMigrationMap === 'function' ? this._settingsMigrationMap() : {};

		// Merge the two, device should override generic
		const settingsMigrationMap = { ...genericSettingsMigrationMap, ...deviceSpecificSettingsMigrationMap };

		// Get all settings keys of the device
		const currentSettings = this.getSettings();
		const currentSettingsKeys = Object.keys(currentSettings);

		// Filter out all settings keys that are not available in the manifest settings
		const migratedSettingsMap = {};
		currentSettingsKeys.forEach(settingKey => {
			if (Object.prototype.hasOwnProperty.call(settingsMigrationMap, settingKey)) {
				this.log(`migrate setting ${settingKey}`);
				migratedSettingsMap[settingKey] = settingsMigrationMap[settingKey]();
			} else {
				migratedSettingsMap[settingKey] = currentSettings[settingKey]
			}
		});

		// Set new settings object, migration done
		this.setSettings(migratedSettingsMap);

		// TODO: fix this, should not be executed always
		if (this.getSetting('deactivate_ALL_ON_ALL_OFF') !== null) {
			this._migrateAllOnAllOff('deactivate_ALL_ON_ALL_OFF', 'allOn', 'allOff');
		}
		this.log('Settings migrated');
	}

	/**
	 * Stub method which can be overridden by devices which do not support the new multi channel device structure of
	 * Qubino.
	 * @returns {boolean}
	 */
	get multiChannelConfigurationDisabled() {
		return false;
	}

	/**
	 * Get method that will return an object with the multi channel node id property if needed, else it will return
	 * an empty object.
	 * @returns {*}
	 */
	get multiChannelNodeObject() {
		if (this.numberOfMultiChannelNodes === 0 || this.multiChannelConfigurationDisabled) return {};
		return {
			multiChannelNodeId: this.findRootDeviceEndpoint(),
		};
	}

	/**
	 * Overrides registerCapability. This method ass the multiChannelNodeObject to the userOpts part of the
	 * registerCapability call (if necessary), it also checks if a device has a capability before trying to register it.
	 * @param args
	 */
	registerCapability(...args) {
		if (this.hasCapability(args[0])) {
			if (args.length >= 2) args[2] = Object.assign(this.multiChannelNodeObject, args[2]);
			else if (args.length === 1) args.push(this.multiChannelNodeObject);
			super.registerCapability(...args);
		}
	}

	/**
	 * Method that resets the accumulated power meter value on the node. It tries to find the root node of the device
	 * and then looks for the COMMAND_CLASS_METER.
	 * TODO rename to meterReset (watch out for conflict)
	 * @returns {*}
	 */
	resetMeter() {
		const multiChannelRootNodeId = this.findRootDeviceEndpoint();
		if (typeof multiChannelRootNodeId === 'number') {
			return this.meterReset({ multiChannelNodeId: multiChannelRootNodeId })
				.then(async res => {
					await this.setCapabilityValue(constants.capabilities.meterPower, 0);
					return res;
				});
		}
		return this.meterReset()
			.then(async res => {
				await this.setCapabilityValue(constants.capabilities.meterPower, 0);
				return res;
			});
	}

	/**
	 * When settings have been changed that change the device structure notify the user of requirement to re-pair.
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeysArr
	 * @returns {{en: string, nl: string}}
	 */
	customSaveMessage(oldSettings, newSettings, changedKeysArr = []) {
		if (changedKeysArr.includes(constants.settings.enableInput1) ||
			changedKeysArr.includes(constants.settings.enableInput2) ||
			changedKeysArr.includes(constants.settings.enableInput3) ||
			changedKeysArr.includes(constants.settings.functionalityInput3) ||
			changedKeysArr.includes(constants.settings.thermostatMode) ||
			changedKeysArr.includes(constants.settings.workingMode)) {
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
		return this.getMultiChannelNodeIdsByDeviceClassGeneric(constants.deviceClassGeneric.sensorMultilevel)[0] || null;
	}

	/**
	 * Method that registers the temperature sensor endpoint and capability if applicable.
	 */
	registerTemperatureSensorEndpoint() {
		const temperatureSensorEndpoint = this.findTemperatureSensorEndpoint();
		if (typeof temperatureSensorEndpoint === 'number') {
			this.log('Configured temperature sensor on multi channel node', temperatureSensorEndpoint);
			this.registerCapability(constants.capabilities.measureTemperature, constants.commandClasses.sensorMultilevel, {
				multiChannelNodeId: temperatureSensorEndpoint,
			});
		} else if (!this.multiChannelConfigurationDisabled && this.hasCapability(constants.capabilities.measureTemperature)) {
			this.log('Could not find temperature sensor multi channel node, removing measure_temperature capability');
			this.removeCapability(constants.capabilities.measureTemperature).catch(err => this.error('Error removing measure_temperature capability', err))
		}
	}

	/**
	 * Method that checks the multi channel nodes of the device and will return the multi channel node id of the found
	 * endpoint that supports the basic device controls.
	 * @returns {*}
	 */
	findRootDeviceEndpoint() {
		if (this.numberOfMultiChannelNodes === 0) return null;
		const rootDeviceClassGeneric = this.rootDeviceClassGeneric;
		for (const i in this.node.MultiChannelNodes) {
			if (this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.switchBinary ||
				this.node.MultiChannelNodes[i].deviceClassGeneric === constants.deviceClassGeneric.switchMultilevel ||
				(typeof rootDeviceClassGeneric === 'string' &&
					this.node.MultiChannelNodes[i].deviceClassGeneric === rootDeviceClassGeneric)) {
				return Number(i);
			}
		}
		return null;
	}

	/**
	 * Method that reads the inputConfiguration array of a device and based on that will register the input endpoints.
	 * If the configuration of the endpoints is not know it will be fetched (configurationGet) once.
	 * @returns {Promise<void>}
	 */
	async registerInputs() {
		this.log('Registering inputs...');

		const inputSensorEndpoints = this.findInputSensorEndpoints();
		if (!Array.isArray(inputSensorEndpoints) || inputSensorEndpoints.length === 0) {
			this.log('No enabled input endpoints found');
			return;
		}
		this.log('Found sensor endpoints', inputSensorEndpoints);

		const inputConfig = this.inputConfiguration;
		if (!Array.isArray(inputConfig)) {
			this.log('Missing input configuration');
			return;
		}

		for (const input of inputConfig) {
			if (!input.hasOwnProperty('defaultEnabled') || input.defaultEnabled === false) {
				const storeKey = `enableInput${input.id}`;
				input.enabled = this.getSetting(storeKey) > 0;
				if (input.enabled !== true && input.enabled !== false || typeof this.getStoreValue(storeKey) !== 'number') {

					// Get configuration parameter value for input enabled setting
					const payload = await this.safeConfigurationGet(input.parameterIndex);
					if (payload === null) {
						this.error('Failed to get input parameter value, aborting...');
						return;
					}

					// Parse the received payload
					const parsedPayload = this._parseInputParameterPayload(payload, input.id);
					input.enabled = parsedPayload > 0;

					// Mark input as initialized to prevent future config parameter gets
					this.setStoreValue(storeKey, parsedPayload);

					// Finally save the fetched setting value
					this.setSettings({ [storeKey]: parsedPayload.toString() });
				}
			}

			// Input is enabled, get the first found mc endpoint
			if (input.enabled === true || input.defaultEnabled === true) {
				input.multiChannelEndpoint = inputSensorEndpoints.shift();

				// Add custom flow trigger definitions
				if (Object.prototype.hasOwnProperty.call(input, 'flowTriggers')) {
					this.registerInputEndpointListener(input.multiChannelEndpoint, input.id, input.flowTriggers);
				} else {
					this.registerInputEndpointListener(input.multiChannelEndpoint, input.id);
				}
			}
		}
	}

	/**
	 * Method that registers a multi channel report listener for the specified endpoint and corresponding input.
	 * @param inputSensorEndpoint
	 * @param inputId
	 */
	registerInputEndpointListener(inputSensorEndpoint, inputId, customFlowTriggers) {
		this.log(`Configured input sensor ${inputId} on multi channel node ${inputSensorEndpoint}`);

		// Determine inputMap, first check for custom map, then use default
		let inputMap = null;
		if (customFlowTriggers) {
			inputMap = { inputId: inputSensorEndpoint, flowTriggers: customFlowTriggers }
		} else {
			inputMap = constants.inputMap[inputId];
		}

		this._inputs[inputSensorEndpoint] = inputMap;

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
	 * Method that acts as a wrapper for configurationGet, it adds retrying (which is sometimes needed, since devices
	 * do not always respond), and does some error handling.
	 * @param index
	 * @param retryOverride
	 * @returns {Promise<*>}
	 */
	async safeConfigurationGet(index, retryOverride = RETRY_GET_CONFIG) {
		let result;
		for (let i = 0; i < retryOverride; ++i) {
			try {
				result = await this.configurationGet({ index });
				break;
			} catch (err) {
				this.error(`failed to get configuration parameter ${index}, retrying (${i + 1}/${retryOverride})`);
			}
		}
		if (!result) {
			this.error(`failed to get configuration parameter ${index}`);
			return null;
		}

		this.log(`got configuration parameter ${index}: ${result}`);
		return result;
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
		if (!inputObj || typeof inputObj.inputId === 'undefined') throw new Error(`unknown_input_sensor_endpoint_${inputSensorEndpoint}`);
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
	 * Method that safely parses a received configuration get payload.
	 * @param payload
	 * @returns {*}
	 * @private
	 */
	_parseInputParameterPayload(payload) {
		try {
			return payload['Configuration Value'][0];
		} catch (err) {
			this.error(`_parseInputParameterPayload() -> failed to parse payload (${payload})`);
			return 0;
		}
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
