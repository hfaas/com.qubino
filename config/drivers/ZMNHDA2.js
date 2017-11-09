'use strict';

// Documentation: https://www.benext.eu/static/manual/qubino/flush-1-relay-ZMNHAA2.pdf

const ZMNHDA2 = 'ZMNHDA2';
const defaultConfig = require('./../defaults');

module.exports = {
	id: ZMNHDA2,
	name: {
		en: `Flush Dimmer (${ZMNHDA2})`,
	},
	zwave: {
		manufacturerId: 345,
		productTypeId: 1,
		productId: 1,
		learnmode: {
			image: `/drivers/${ZMNHDA2}/assets/learnmode.svg`,
			instruction: defaultConfig.learnmode.instruction,
		},
		associationGroups: [
			1,
			2,
			3,
			4,
		],
		unlearnmode: {
			instruction: defaultConfig.learnmode.instruction,
			image: `/drivers/${ZMNHDA2}/assets/learnmode.svg`,
		},
	},
	class: 'socket',
	capabilities: [
		'onoff',
		'dim',
		'measure_power',
		'meter_power',
		'measure_temperature',
	],
	capabilitiesOptions: {
		onoff: {
			setOnDim: false,
		},
	},
	mobile: {
		components: [
			{
				id: 'icon',
				capabilities: [
					'onoff',
				],
			},
			{
				id: 'slider',
				capabilities: [
					'dim',
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
		large: `/drivers/${ZMNHDA2}/assets/images/large.png`,
		small: `/drivers/${ZMNHDA2}/assets/images/small.png`,
	},
	settings: [
		{
			id: 'input_1_type',
			type: 'dropdown',
			zwave: {
				index: 1,
				size: 1,
			},
			values: [
				{
					id: '0',
					label: {
						en: 'Mono-stable switch type',
						nl: 'Mono-stable switch type',
					},
				},
				{
					id: '1',
					label: {
						en: 'Bi-stable switch type',
						nl: 'Bi-stable switch type',
					},
				},
			],
			value: '0',
			label: {
				en: 'Input 1 switch type',
				nl: 'Input 1 schakel type',
			},
			hint: {
				en: 'This parameter sets the type of input switch used.',
				nl: 'Deze parameter bepaalt het type input switch.',
			},
		},
		{
			id: 'input_2_contact_type',
			type: 'dropdown',
			zwave: {
				index: 2,
				size: 1,
			},
			values: [
				{
					id: '0',
					label: {
						en: 'NO (normally open) input type',
						nl: 'NO (normaal open) input type',
					},
				},
				{
					id: '1',
					label: {
						en: 'NC (normally close) input type',
						nl: 'NG (normaal gesloten) input type',
					},
				},
			],
			value: '0',
			label: {
				en: 'Input 2 contact type',
				nl: 'Input 2 contact type',
			},
			hint: {
				en: 'This parameter sets the contact type of input 2.',
				nl: 'Deze parameter bepaalt het contact type van input 2.',
			},
		},
		{
			id: 'input_3_contact_type',
			type: 'dropdown',
			zwave: {
				index: 3,
				size: 1,
			},
			values: [
				{
					id: '0',
					label: {
						en: 'NO (normally open) input type',
						nl: 'NO (normaal open) input type',
					},
				},
				{
					id: '1',
					label: {
						en: 'NC (normally close) input type',
						nl: 'NG (normaal gesloten) input type',
					},
				},
			],
			value: '0',
			label: {
				en: 'Input 3 contact type',
				nl: 'Input 3 contact type',
			},
			hint: {
				en: 'This parameter sets the contact type of input 3.',
				nl: 'Deze parameter bepaalt het contact type van input 3.',
			},
		},
		{
			id: 'deactivate_ALL_ON_ALL_OFF',
			type: 'dropdown',
			zwave: {
				index: 10,
				size: 2,
			},
			values: [
				{
					id: '0',
					label: {
						en: 'All on is not active, all off is not active',
						nl: 'Alles aan is niet actief, alles uit is niet actief',
					},
				},
				{
					id: '1',
					label: {
						en: 'All on is not active, all off active',
						nl: 'Alles aan is niet actief, alles uit is actief',
					},
				},
				{
					id: '2',
					label: {
						en: 'All on active, all off is not active',
						nl: 'Alles aan is actief, alles uit is niet actief',
					},
				},
				{
					id: '255',
					label: {
						en: 'All on active, all off active',
						nl: 'Alles aan is actief, alles uit is actief',
					},
				},
			],
			value: '255',
			label: {
				en: 'All on / all off',
				nl: 'Alles aan / alles uit',
			},
			hint: {
				en: 'Module responds to commands all on / all off that may be sent by the main controller or by other controller belonging to the system',
				nl: "Module reageert op commando's alles aan / alles uit die mogelijk worden verstuurd door de controller.",
			},
		},
		{
			id: 'state_of_device_after_power_failure',
			type: 'checkbox',
			zwave: {
				index: 30,
				size: 1,
			},
			label: {
				en: 'Restore state',
				nl: 'Herstel status',
			},
			value: false,
			hint: {
				en: 'The parameter defines if the state of the device should be either saved or not in case of a power failure',
				nl: 'Deze parameter bepaalt of the status van het apparaat moet worden opgeslagen of niet na een stroom onderbreking',
			},
		},
		{
			id: 'power_report_on_power_change',
			type: 'number',
			zwave: {
				index: 40,
				size: 1,
			},
			label: {
				en: 'Power report on power change',
				nl: 'Stroomverbruik update bij verandering van',
			},
			value: 5,
			attr: {
				min: 0,
				max: 100,
			},
			hint: {
				en: 'The parameter determines if a power report should be sent depending on the predefined power change in percentage',
				nl: 'Deze parameter zorgt ervoor dat bij de gedefinieerde verandering in stroomverbruik (%) een update wordt verzonden naar Homey',
			},
		},
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
				max: 65535,
			},
			hint: {
				en: 'A power report is sent based on the predefined time interval in seconds. 0 -> Function is disabled. Value range: 1 – 65535.',
				nl: 'Stel het interval (seconden, 1 - 65535) in waarop een stroomverbruik update moet worden verstuurt naar Homey. 0 -> geen updates.',
			},
		},
		{
			id: 'maximum_dimming_value',
			type: 'number',
			zwave: {
				index: 61,
				size: 1,
			},
			label: {
				en: 'Maximum dimming value',
				nl: 'Maximale dim waarde',
			},
			value: 99,
			attr: {
				min: 2,
				max: 99,
			},
			hint: {
				en: 'The parameter defines the maximum dimming value. The maximum level may not be higher than the minimum level.',
				nl: 'Deze parameter bepaalt de maximale dim waarde. De maximale dim waarde mag niet hoger zijn dan de minimale dim waarde.',
			},
		},
		{
			id: 'minimum_dimming_value',
			type: 'number',
			zwave: {
				index: 60,
				size: 1,
			},
			label: {
				en: 'Minimum dimming value',
				nl: 'Minimale dim waarde',
			},
			value: 1,
			attr: {
				min: 1,
				max: 98,
			},
			hint: {
				en: 'The parameter defines the minimum dimming value. The minimum level may not be higher than the maximum level.',
				nl: 'Deze parameter bepaalt de minimale dim waarde. De minimale dim waarde mag niet hoger zijn dan de maximale dim waarde.',
			},
		},
		{
			id: 'dimming_time_soft_on_off',
			type: 'number',
			zwave: {
				index: 65,
				size: 2,
			},
			label: {
				en: 'Dimming time (soft on/off)',
				nl: 'Dim periode (soft on/off)',
			},
			value: 100,
			attr: {
				min: 1,
				max: 255,
			},
			hint: {
				en: 'Parameter that determines the time of moving the Dimmer between min. and max. dimming values by short press of push button I1 or controlled through UI. Default value is 100 (dimming time between min. and max. dimming values is 1s). 1 - 255 = 10 mseconds – 2550 mseconds (2,55s), step is 10 mseconds.',
				nl: 'Parameter die de dim periode bepaalt bij het schakelen van de dimmer tussen minimale en maximale waarde. Standaard waarde is 100 (1000ms). 1 - 255 = 10 miliseconds – 2550 miliseconds (2,55s), stap is 10 miliseconds.',
			},
		},
		{
			id: 'dimming_time_when_key_pressed',
			type: 'number',
			zwave: {
				index: 66,
				size: 2,
			},
			label: {
				en: 'Dimming duration I1',
				nl: 'Dim periode I1',
			},
			value: 3,
			attr: {
				min: 1,
				max: 255,
			},
			hint: {
				en: 'Time (in seconds) of moving the dimmer between minimum and maximum dimming values by push button I1 (short press).',
				nl: 'Tijd (in seconden) die nodig is voor het veranderen van het minimale naar maximale dim niveau (d.m.v. korte druk op I1).',
			},
		},
	],
};
