'use strict';

const QubinoDevice = require('../../lib/QubinoDevice');
const { CAPABILITIES, COMMAND_CLASSES } = require('../../lib/constants');

/**
 * Smart Plug (ZMNHYD)
 * Extended manual: https://qubino.com/manuals/Smart_Plug_16A.pdf
 * TODO: add maintenance action for meter reset
 */
class ZMNHYD extends QubinoDevice {
  get multiChannelConfigurationDisabled() {
    return true;
  }

  /**
   * Method that will register capabilities of the device based on its configuration.
   * @private
   */
  registerCapabilities() {
    this.registerCapability(CAPABILITIES.METER_POWER, COMMAND_CLASSES.METER);
    this.registerCapability(CAPABILITIES.MEASURE_POWER, COMMAND_CLASSES.METER);
    this.registerCapability(CAPABILITIES.MEASURE_VOLTAGE, COMMAND_CLASSES.METER);
    this.registerCapability(CAPABILITIES.MEASURE_CURRENT, COMMAND_CLASSES.METER);
    this.registerCapability(CAPABILITIES.ONOFF, COMMAND_CLASSES.SWITCH_BINARY);
  }
}

module.exports = ZMNHYD;
