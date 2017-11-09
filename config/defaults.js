'use strict';

module.exports = {
	learnmode: {
		instruction: {
			en: 'There are three ways to start the pairing process:\n\n1. Wait for auto-inclusion to start after connecting the device to a power source (this only works if the device has been reset completely).\n2. Toggle the switch connected to input 1 three times within three seconds.\n3. Press the service button (S) for more than two seconds.',
			nl: 'Er zijn drie manieren om het apparaat toe te voegen:\n\n1. Wacht op de automatische inclusie die start na het aansluiten van het apparaat op een stroomvoorziening (dit werkt alleen als het apparaat is terug gezet naar fabrieksinstellingen).\n2. Schakel de schakelaar aangesloten op input 1 drie keer binnen drie seconden.\n3. Houd de service knop (S) langer dan twee seconden ingedrukt.',
		},
	},
	unlearnmode: {
		instruction: {
			en: 'There are two ways to remove this device:\n\n1. Toggle the switch connected to input 1 five times within three seconds.\n2. Press the service button (S) for more than two seconds (longer than six seconds will reset the device as well).',
			nl: 'Er zijn twee manieren om het apparaat te verwijderen:\n\n1. Schakel de schakelaar aangesloten op input 1 vijf keer binnen drie seconden.\n3. Houd de service knop (S) langer dan twee seconden ingedrukt (langer dan zes seconden zal het apparaat terug zetten naar fabrieksinstellingen).',
		},
	},
	settings: {
		input_1_type: {
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
						en: 'Monostable switch',
						nl: 'Pulsschakelaar',
					},
				},
				{
					id: '1',
					label: {
						en: 'Bistable switch type',
						nl: 'Tuimelschakelaar',
					},
				},
			],
			value: '0',
			label: {
				en: 'Input 1 switch type',
				nl: 'Input 1 schakel type',
			},
			hint: {
				en: 'This parameter sets the input type',
				nl: 'Deze parameter bepaalt het input type',
			},
		},
		input_2_contact_type: {

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
				en: 'This parameter sets the contact type of input 2',
				nl: 'Deze parameter bepaalt het contact type van input 2',
			},
		},
		input_3_contact_type: {
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
				en: 'This parameter sets the contact type of input 3',
				nl: 'Deze parameter bepaalt het contact type van input 3',
			},
		},
		deactivate_all_on_all_off: {
			id: 'deactivate_ALL_ON_ALL_OFF',
			type: 'dropdown',
			zwave: {
				index: 10,
				size: 2,
				signed: false,
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
		state_of_device_after_power_failure: {
			id: 'state_of_device_after_power_failure',
			type: 'checkbox',
			zwave: {
				index: 30,
				size: 1,
			},
			label: {
				en: 'Restore state after power failure',
				nl: 'Herstel status na stroom onderbreking',
			},
			value: true,
			hint: {
				en: 'The parameter defines if the state of the device should either be saved or not in case of a power failure',
				nl: 'Deze parameter bepaalt of the status van het apparaat moet worden opgeslagen of niet na een stroom onderbreking',
			},
		},
		power_report_on_power_change: {
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
			value: 20,
			attr: {
				min: 0,
				max: 100,
			},
			hint: {
				en: 'The parameter determines if a power report should be sent depending on the predefined power change in percentage',
				nl: 'Deze parameter zorgt ervoor dat bij de gedefinieerde verandering in stroomverbruik (%) een update wordt verzonden naar Homey',
			},
		},
	},
};
