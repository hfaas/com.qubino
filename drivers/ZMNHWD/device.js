'use strict';

const constants = require('../../lib/constants');
const QubinoDimDevice = require('../../lib/QubinoDimDevice');

/**
 * Flush RGBW Dimmer (ZMNHWD)
 * Extended manual: http://qubino.com/download/2063/
 * Regular manual: http://qubino.com/download/1537/
 *
 * TODO: logic
 * TODO: add support for different modes (4 dimmable devices example)
 * TODO: custom setting parser: autoSceneModeTransitionDuration
 * TODO: add 4-dimmers-mode to re-pair settings
 */
class ZMNHWD extends QubinoDimDevice {

	/**
	 * Method that will register capabilities of the device based on its configuration.
	 * @private
	 */
	registerCapabilities() {

	}
}

module.exports = ZMNHWD;
