'use strict';

const ZMNHAD1 = 'ZMNHAD1';
const defaultConfig = require('./../defaults');

module.exports = {
	id: ZMNHAD1,
	name: {
		en: `Flush 1 Relay (${ZMNHAD1})`,
		nl: `Inbouw Relais (${ZMNHAD1})`,
	},
	zwave: {
		manufacturerId: 345,
		productTypeId: 2,
		productId: 82,
		learnmode: {
			image: `/drivers/${ZMNHAD1}/assets/learnmode.svg`,
			instruction: defaultConfig.learnmode.instruction,
		},
		associationGroupsMultiChannel: [
			1,
			3,
			6,
		],
		defaultConfiguration: [
			{
				id: 40,
				size: 1,
				value: 20,
			},
			{
				id: 100,
				size: 1,
				value: 9,
			},
			{
				id: 101,
				size: 1,
				value: 9,
			},
		],
		unlearnmode: {
			instruction: defaultConfig.unlearnmode.instruction,
			image: `/drivers/${ZMNHAD1}/assets/learnmode.svg`,
		},
	},
	class: 'socket',
	capabilities: [
		'onoff',
		'measure_power',
		'meter_power',
		'measure_temperature',
	],
	mobile: {
		components: [
			{
				id: 'icon',
				capabilities: [
					'onoff',
				],
			},
			{
				id: 'toggle',
				capabilities: [
					'onoff',
				],
			},
			{
				id: 'sensor',
				capabilities: [
					'measure_power',
					'meter_power',
					'measure_temperature',
				],
			},
		],
	},
	images: {
		large: `/drivers/${ZMNHAD1}/assets/images/large.png`,
		small: `/drivers/${ZMNHAD1}/assets/images/small.png`,
	},
	settings: [
		defaultConfig.settings.input_1_type,
		defaultConfig.settings.input_2_contact_type,
		defaultConfig.settings.input_3_contact_type,
		defaultConfig.settings.deactivate_all_on_all_off,
		defaultConfig.settings.state_of_device_after_power_failure,
		{
			id: 'automatic_turning_off_output_after_set_time',
			type: 'number',
			zwave: {
				index: 11,
				size: 2,
			},
			label: {
				en: 'Automatic turning off output after set time',
				nl: 'Automatisch uitschakelen van output na bepaalde tijd',
			},
			value: 0,
			attr: {
				min: 0,
				max: 32535,
			},
			hint: {
				en: 'Time in seconds (1 - 32535), 0 will disable the automatically turning off',
				nl: 'Tijd in seconden (1 - 32535), 0 schakelt het automatisch uitschakelen uit',
			},
		},
		{
			id: 'automatic_turning_on_output_after_set_time',
			type: 'number',
			zwave: {
				index: 12,
				size: 2,
			},
			label: {
				en: 'Automatic turning on output after set time',
				nl: 'Automatisch inschakelen van output na bepaalde tijd',
			},
			value: 0,
			attr: {
				min: 0,
				max: 32535,
			},
			hint: {
				en: 'Time in seconds (1 - 32535), 0 will disable the automatically turning on',
				nl: 'Tijd in seconden (1 - 32535), 0 schakelt het automatisch inschakelen uit',
			},
		},
		defaultConfig.settings.power_report_on_power_change,
		{
			id: 'power_report_by_time_interval',
			type: 'number',
			zwave: {
				index: 42,
				size: 2,
			},
			label: {
				en: 'Power report by time Interval',
				nl: 'Stroomverbruik update per tijdsinterval',
			},
			value: 300,
			attr: {
				min: 0,
				max: 32535,
			},
			hint: {
				en: 'A power report is sent based on the predefined time interval in seconds. 0 -> Function is disabled. Value range: 1 – 32535.',
				nl: 'Stel het interval (seconden, 1 - 32535) in waarop een stroomverbruik update moet worden verstuurt naar Homey. 0 -> geen updates.',
			},
		},
		{
			id: 'output_switch_selection',
			type: 'dropdown',
			zwave: {
				index: 63,
				size: 1,
			},
			values: [
				{
					id: '0',
					label: {
						en: 'When system is turned off the output is 0V (NC)',
						nl: 'Wanneer systeem is uitgeschakeld zet output op 0V (NG)',
					},
				},
				{
					id: '1',
					label: {
						en: 'When system is turned off the output is 230V or 24V (NO)',
						nl: 'Wanneer systeem is uitgeschakeld zet output op 230V of 24V (NO)',
					},
				},
			],
			value: '0',
			label: {
				en: 'Output switch selection',
				nl: 'Output schakel selectie',
			},
		},
		{
			id: 'temperature_sensor_offset',
			type: 'number',
			zwave: {
				index: 110,
				size: 2,
			},
			label: {
				en: 'Temperature sensor offset',
				nl: 'Temperatuur sensor kalibratie',
			},
			value: 32536,
			attr: {
				min: 1,
				max: 32536,
			},
			hint: {
				en: '32536 = offset is 0.0 °C. From 1 to 100 - value from 0.1 °C to 10.0 °C is added to actual measured temperature. From 1001 to 1100 - value from -0.1 °C to -10.0 °C is subtracted to actual measured temperature.',
				nl: '32536 = verschil is 0,0 °C. Van 1 tot 100 - waarde van 0,1 °C tot 10,0 °C wordt opgeteld bij de gemeten temperatuur. Van 1001 tot 1100 - waarde van -0,1 °C tot -10,0 °C wordt afgetrokken van de gemeten temperatuur',
			},
		},
		{
			id: 'digital_temperature_sensor_reporting',
			type: 'number',
			zwave: {
				index: 120,
				size: 1,
			},
			label: {
				en: 'Digital temperature change for report',
				nl: 'Digitale temperatuur waarde verandering voor report',
			},
			value: 5,
			attr: {
				min: 0,
				max: 127,
			},
			hint: {
				en: 'Default value 5 = 0.5 °C change. 0 - Reporting disabled. 1 - 127 = 0.1 °C - 12.7 °C, step is 0.1 °C.',
				nl: 'Standaard waarde 5 = 0,5 °C verandering. 0 - Reporting uitgeschakeld. 1 - 127 = 0,1 °C - 12,7 °C, stap grootte is 0,1 °C.',
			},
		},
	],
};
