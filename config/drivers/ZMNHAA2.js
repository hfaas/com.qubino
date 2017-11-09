'use strict';

const ZMNHAA2 = 'ZMNHAA2';
const learnmode = require('./../defaults').learnmode;
const unlearnmode = require('./../defaults').unlearnmode;
const settings = require('./../defaults').settings;

// TODO test, missing device

module.exports = {
	id: ZMNHAA2,
	name: {
		en: `Flush 1 Relay (${ZMNHAA2})`,
		nl: `Inbouw Relais (${ZMNHAA2})`,
	},
	zwave: {
		manufacturerId: 345,
		productTypeId: 2,
		productId: 2,
		learnmode: {
			image: `/drivers/${ZMNHAA2}/assets/learnmode.svg`,
			instruction: learnmode.instruction,
		},
		associationGroups: [
			1,
			2,
			3,
			4,
		],
		defaultConfiguration: [
			{
				id: 40,
				size: 1,
				value: 20,
			},
		],
		unlearnmode: {
			instruction: unlearnmode.instruction,
			image: `/drivers/${ZMNHAA2}/assets/learnmode.svg`,
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
		large: `/drivers/${ZMNHAA2}/assets/images/large.png`,
		small: `/drivers/${ZMNHAA2}/assets/images/small.png`,
	},
	settings: [
		settings.input_1_type,
		settings.input_2_contact_type,
		settings.input_3_contact_type,
		settings.deactivate_all_on_all_off,
		settings.state_of_device_after_power_failure,
		{
			id: 'automatic_turning_off_output_q1_after_set_time',
			type: 'number',
			zwave: {
				index: 11,
				size: 2,
				signed: false,
			},
			label: {
				en: 'Automatic turning off output q1 after set time',
				nl: 'Automatisch uitschakelen van output q1 na bepaalde tijd',
			},
			value: 0,
			attr: {
				min: 0,
				max: 325369,
			},
			hint: {
				en: 'Time in seconds (1 - 32535), 0 will disable the automatically turning off.',
				nl: 'Tijd in seconden (1 - 32535), 0 schakelt het automatisch uitschakelen uit.',
			},
		},
		settings.power_report_on_power_change,
		{
			id: 'power_report_by_time_interval_q1',
			type: 'number',
			zwave: {
				index: 42,
				size: 2,
				signed: false,
			},
			label: {
				en: 'Power report by time interval',
				nl: 'Stroomverbruik update per tijdsinterval',
			},
			value: 300,
			attr: {
				min: 0,
				max: 65535,
			},
			hint: {
				en: 'A power report is sent based on the predefined time interval in seconds. 0 -> Function is disabled. Value range: 1 – 65535.',
				nl: 'Stel het interval (seconden, 1 - 65535) in waarop een stroomverbruik update moet worden verstuurt naar Homey. 0 -> geen updates.',
			},
		},
	],
};
