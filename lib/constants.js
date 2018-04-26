'use strict';

module.exports = {
	multiChannelNodeIdOne: { multiChannelNodeId: 1 },
	multiChannelNodeIdTwo: { multiChannelNodeId: 2 },
	multiChannelNodeIdThree: { multiChannelNodeId: 3 },
	multiChannelNodeIdFour: { multiChannelNodeId: 4 },
	capabilities: {
		dim: 'dim',
		onoff: 'onoff',
		meterPower: 'meter_power',
		measurePower: 'measure_power',
		measureTemperature: 'measure_temperature',
		windowCoveringsTiltSet: 'windowcoverings_tilt_set',
	},
	deviceClassGeneric: {
		sensorMultilevel: 'GENERIC_TYPE_SENSOR_MULTILEVEL',
		sensorBinary: 'GENERIC_TYPE_SENSOR_BINARY',
		switchBinary: 'GENERIC_TYPE_SWITCH_BINARY',
		sensorNotification: 'GENERIC_TYPE_SENSOR_NOTIFICATION',
		switchMultilevel: 'GENERIC_TYPE_SWITCH_MULTILEVEL',
	},
	commandClasses: {
		meter: 'METER',
		notification: 'NOTIFICATION',
		sensorBinary: 'SENSOR_BINARY',
		switchBinary: 'SWITCH_BINARY',
		switchMultilevel: 'SWITCH_MULTILEVEL',
		sensorMultilevel: 'SENSOR_MULTILEVEL',
		sensorBinaryReport: 'SENSOR_BINARY_REPORT',
		notificationReport: 'NOTIFICATION_REPORT',
		commands: {
			meterReset: 'METER_RESET',
		},
	},
	flows: {
		allOn: 'allOn',
		allOff: 'allOff',
		resetMeter: 'resetMeter',
		inputTwoToggled: 'inputTwoToggled',
		inputTwoTurnedOn: 'inputTwoTurnedOn',
		inputTwoTurnedOff: 'inputTwoTurnedOff',
		inputThreeToggled: 'inputThreeToggled',
		inputThreeTurnedOn: 'inputThreeTurnedOn',
		inputThreeTurnedOff: 'inputThreeTurnedOff',
	},
	inputMap: {
		2: {
			inputId: 2,
			flowTriggers: {
				on: 'inputTwoTurnedOn',
				off: 'inputTwoTurnedOff',
				toggle: 'inputTwoToggled',
			},
		},
		3: {
			inputId: 3,
			flowTriggers: {
				on: 'inputThreeTurnedOn',
				off: 'inputThreeTurnedOff',
				toggle: 'inputThreeToggled',
			},
		},
	},
	settings: {
		allOn: 'allOn',
		allOff: 'allOff',
		workingMode: 'workingMode',
		dimDuration: 'dimDuration',
		enableInput2: 'enableInput2',
		enableInput3: 'enableInput3',
		restoreStatus: 'restoreStatus',
		operatingMode: 'operatingMode',
		minimumDimValue: 'minimumDimValue',
		maximumDimValue: 'maximumDimValue',
		motorMovingTime: 'motorMovingTime',
		slatsTiltingTime: 'slatsTiltingTime',
		powerReportDelayTime: 'powerReportDelayTime',
		temperatureSensorOffset: 'temperatureSensorOffset',
		motorOperationDetection: 'motorOperationDetection',
		delayBetweenMotorMovement: 'delayBetweenMotorMovement',
		multiChannelReportingConfigured: 'multiChannelReportingConfigured',
		temperatureSensorReportingThreshold: 'temperatureSensorReportingThreshold',
		size: {
			allOnAllOff: 2,
		},
		index: {
			allOnAllOff: 10,
		},
	},
};