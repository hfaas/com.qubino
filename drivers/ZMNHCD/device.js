'use strict';

const MeshDriverUtil = require('homey-meshdriver').Util;
const GenericShutterDevice = require('./../genericShutterDevice');

const MOTOR_MOVING_TIME = 'motorMovingTime';
const SLATS_TILTING_TIME_SETTING = 'slatsTiltingTime';
const POWER_REPORT_DELAY_SETTING = 'powerReportDelayTime';
const TEMPERATURE_SENSOR_OFFSET_SETTING = 'temperatureSensorOffset';
const DELAY_BETWEEN_MOTOR_MOVEMENT_SETTING = 'delayBetweenMotorMovement';
const WINDOWCOVERINGS_TILT_SET_CAPABILITY = 'windowcoverings_tilt_set';

// TODO driver keys
// TODO test settings
// TODO test dim duration
// TODO capability constants
// TODO test driver separation

class ZMNHCD extends GenericShutterDevice {

	async onMeshInit() {
		super.onMeshInit();

		// Register configuration dependent capabilities
		this._registerCapabilities();

		// Register custom setting parsers
		this._registerSettings();
	}

	/**
	 * Method that will register capabilities based on the detected configuration of the device; it can have four
	 * different configurations (regular/with temperature sensor/venetian blind mode/venetian blind mode with
	 * temperature sensor). Since the windowcoverings_tilt capability can not be hidden when the device does not support
	 * it, an error will be shown to the user and the value will remain zero.
	 * @private
	 */
	_registerCapabilities() {

		// Start calibration on button press
		this.registerCapabilityListener('calibration', this._startCalibration.bind(this));

		switch (this.numberOfMultiChannelNodes) {
			case 0:
				/**
				 * Configuration: venetian blind mode is not activated and no temperature sensor connected.
				 * Regular motor control on root node.
				 */
				this.registerCapability('meter_power', 'METER');
				this.registerCapability('measure_power', 'METER');
				this.registerCapability('dim', 'SWITCH_MULTILEVEL');

				// Set venetian blind motor control slider to zero, since it can not be used.
				this.setCapabilityValue(WINDOWCOVERINGS_TILT_SET_CAPABILITY, 0);

				// Throw and show an error when user tries to control venetian blinds when venetian blind mode is disabled
				this.registerCapabilityListener(WINDOWCOVERINGS_TILT_SET_CAPABILITY, this._handleUnconfiguredTiltSet.bind(this));
				break;
			case 2:
				if (this.isTemperatureSensorConnected) {
					/**
					 * Configuration: venetian blind mode is not activated and temperature sensor is connected.
					 * Temperature sensor multi channel node id is 2.
					 * Regular motor control multi channel node id is 1.
					 */
					this.registerCapability('meter_power', 'METER', { multiChannelNodeId: 1 });
					this.registerCapability('measure_power', 'METER', { multiChannelNodeId: 1 });
					this.registerCapability('dim', 'SWITCH_MULTILEVEL', { multiChannelNodeId: 1 });
					this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', { multiChannelNodeId: 2 });

					// Set venetian blind motor control slider to zero, since it can not be used.
					this.setCapabilityValue(WINDOWCOVERINGS_TILT_SET_CAPABILITY, 0);

					// Throw and show an error when user tries to control venetian blinds when venetian blind mode is disabled
					this.registerCapabilityListener(WINDOWCOVERINGS_TILT_SET_CAPABILITY, this._handleUnconfiguredTiltSet.bind(this));

				} else {
					/**
					 * Configuration: venetian blind mode is activated and no temperature sensor connected.
					 * Venetian blind motor control multi channel node id is 2.
					 * Regular motor control multi channel node id is 1.
					 */
					this.registerCapability('meter_power', 'METER', { multiChannelNodeId: 1 });
					this.registerCapability('measure_power', 'METER', { multiChannelNodeId: 1 });
					this.registerCapability('dim', 'SWITCH_MULTILEVEL', { multiChannelNodeId: 1 });
					this.registerCapability(WINDOWCOVERINGS_TILT_SET_CAPABILITY, 'SWITCH_MULTILEVEL', { multiChannelNodeId: 2 });
				}
				break;
			case 3:
				/**
				 * Configuration: venetian blind mode is activated and temperature sensor is connected.
				 * Temperature sensor multi channel node id is 3.
				 * Venetian blind motor control multi channel node id is 2.
				 * Regular motor control multi channel node id is 1.
				 */
				this.registerCapability('meter_power', 'METER', { multiChannelNodeId: 1 });
				this.registerCapability('measure_power', 'METER', { multiChannelNodeId: 1 });
				this.registerCapability('dim', 'SWITCH_MULTILEVEL', { multiChannelNodeId: 1 });
				this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', { multiChannelNodeId: 3 });
				this.registerCapability(WINDOWCOVERINGS_TILT_SET_CAPABILITY, 'SWITCH_MULTILEVEL', { multiChannelNodeId: 2 });

				break;
			default:
				this.error(`unknown configuration detected (multi channel nodes: 
				${this.numberOfMultiChannelNodes}, temp sensor: ${this.isTemperatureSensorConnected})`);
		}
	}

	/**
	 * Method that registers some custom settings parsers.
	 * @private
	 */
	_registerSettings() {

		// Multiply slats tilting time by 100
		this.registerSetting(SLATS_TILTING_TIME_SETTING, value => value * 100);

		// Multiply motor moving time by 10
		this.registerSetting(MOTOR_MOVING_TIME, value => value * 10);

		// Multiply power report delay time by 10
		this.registerSetting(POWER_REPORT_DELAY_SETTING, value => value * 10);

		// Multiply delay between motor movement by 10
		this.registerSetting(DELAY_BETWEEN_MOTOR_MOVEMENT_SETTING, value => value * 10);

		// Map temperature calibration value
		this.registerSetting(TEMPERATURE_SENSOR_OFFSET_SETTING, value => {
			if (value === 0) return 32536;

			// -10 till -0.1 becomes 1100 till 1001
			if (value < 0) return MeshDriverUtil.mapValueRange(-10, -0.1, 1100, 1001, value);

			// 10 till 0.1 becomes 100 till 1
			return MeshDriverUtil.mapValueRange(10, 0.1, 100, 1, value);
		});
	}
}

module.exports = ZMNHCD;
