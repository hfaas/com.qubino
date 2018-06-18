'use strict';

const util = require('homey-meshdriver').Util;
const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * Flush RGBW Dimmer (ZMNHWD)
 * Extended manual: http://qubino.com/download/2063/
 * Regular manual: http://qubino.com/download/1537/
 *
 * TODO: logic
 * TODO: icons and images
 * TODO: add support for different modes (4 dimmable devices example)
 * TODO: custom setting parser: autoSceneModeTransitionDuration
 * TODO: add 4-dimmers-mode to re-pair settings
 * TODO: it seems the COLOR_SET command does not function
 */
class ZMNHWD extends QubinoDimDevice {

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {
		this.registerCapability(constants.capabilities.onoff, constants.commandClasses.switchBinary);
		this.registerCapability(constants.capabilities.dim, constants.commandClasses.switchMultilevel);
		this.registerMultipleCapabilityListener([constants.capabilities.lightHue, constants.capabilities.lightSaturation, constants.capabilities.lightTemperature, constants.capabilities.lightMode], (valueObj, optsObj) => {
			this.log('valueObj', valueObj);
			this.log('optsObj', optsObj);
			// TODO: duration
			// let lightHue = this.getCapabilityValue(constants.capabilities.lightHue);
			// let lightSaturation = this.getCapabilityValue(constants.capabilities.lightSaturation);
			// let lightTemperature = this.getCapabilityValue(constants.capabilities.lightTemperature);
			// let lightMode = this.getCapabilityValue(constants.capabilities.lightMode);

			let {
				light_hue: lightHue,
				light_saturation: lightSaturation,
				light_temperature: lightTemperature,
				light_mode: lightMode,
			} = valueObj;

			const dim = this.getCapabilityValue(constants.capabilities.dim);

			if (typeof lightHue === 'undefined') lightHue = this.getCapabilityValue(constants.capabilities.lightHue);
			if (typeof lightSaturation === 'undefined') lightSaturation = this.getCapabilityValue(constants.capabilities.lightSaturation);
			if (typeof lightTemperature === 'undefined') lightTemperature = this.getCapabilityValue(constants.capabilities.lightTemperature);
			if (typeof lightMode === 'undefined') lightMode = this.getCapabilityValue(constants.capabilities.lightMode);


			// TODO: if light_mode = color
			let { red = 0, green = 0, blue = 0 } = util.convertHSVToRGB({
				hue: lightHue,
				saturation: lightSaturation,
				value: dim,
			});

			// TODO: lightMode unknown
			if (lightMode !== 'color') {
				red = 0;
				green = 0;
				blue = 0;
			}

			// TODO: if light_mode = temperature
			const ww = (lightTemperature >= 0.5 && lightMode === 'temperature') ? util.mapValueRange(0.5, 1, 10, 255, lightTemperature) : 0;
			const cw = (lightTemperature < 0.5 && lightMode === 'temperature') ? util.mapValueRange(0, 0.5, 255, 10, lightTemperature) : 0;

			console.log('SET:', lightMode);
			const obj = {
				Properties1: {
					'Color Component Count': 5,
				},
				Duration: 255,
				vg1: [
					{
						'Color Component ID': 0,
						Value: Math.round(ww * dim),
					},
					{
						'Color Component ID': 1,
						Value: Math.round(cw * dim),
					},
					{
						'Color Component ID': 2,
						Value: Math.round(red * dim),
					},
					{
						'Color Component ID': 3,
						Value: Math.round(green * dim),
					},
					{
						'Color Component ID': 4,
						Value: Math.round(blue * dim),
					},
				],
			};

			console.log(obj);
			return this.node.CommandClass[`COMMAND_CLASS_${constants.commandClasses.switchColor}`].SWITCH_COLOR_SET(obj).then(res => {
				console.log('SWITCH_COLOR_SET result', res);
				return res;
			}).catch(err => {
				console.error('SWITCH_COLOR_SET error', err);
				throw err;
			});
		}, 500);

	}
}

module.exports = ZMNHWD;
