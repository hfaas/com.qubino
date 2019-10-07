'use strict';

const QubinoDimDevice = require('../../lib/QubinoDimDevice');
const { CAPABILITIES, COMMAND_CLASSES } = require('../../lib/constants');

/**
 * Flush Dimmer 0 - 10V (ZMNHVD)
 * Manual: https://qubino.com/manuals/Flush_Dimmer_0-10V.pdf
 * TODO: switching input 1 does not have any effect
 * TODO: add support for analogue sensor connected to input 1
 */
class ZMNHVD extends QubinoDimDevice {
  /**
   * Override default multi channel configuration.
   * @returns {boolean}
   */
  get multiChannelConfigurationDisabled() {
    return true;
  }

  /**
   * Method that will register capabilities of the device based on its configuration.
   * @private
   */
  registerCapabilities() {
    this.registerCapability(CAPABILITIES.DIM, COMMAND_CLASSES.SWITCH_MULTILEVEL);
    this.registerCapability(CAPABILITIES.ONOFF, COMMAND_CLASSES.SWITCH_BINARY);
  }
}

module.exports = ZMNHVD;
