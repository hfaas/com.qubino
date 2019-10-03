'use strict';

const QubinoShutterDevice = require('../../lib/QubinoShutterDevice');
const { CAPABILITIES, COMMAND_CLASSES, DEVICE_CLASS_GENERIC } = require('../../lib/constants');

/**
 * Flush Shutter (ZMNHCD)
 * Extended manual: http://qubino.com/download/2075/
 * Regular manual: http://qubino.com/download/1041/
 * TODO: maintenance actions for calibration/reset meter
 * TODO: calibration, blinds need to be lowered all the way down before calibration starts
 */
class ZMNHCD extends QubinoShutterDevice {
  /**
   * Method that will register capabilities of the device based on its configuration.
   * @private
   */
  async registerCapabilities() {
    // Always register meter power and measure power on root node
    this.registerCapability(CAPABILITIES.METER_POWER, COMMAND_CLASSES.METER);
    this.registerCapability(CAPABILITIES.MEASURE_POWER, COMMAND_CLASSES.METER);

    // If temperature sensor connected or venetian blind mode enabled
    if (this.numberOfMultiChannelNodes > 0) {
      this.log('multi channel configuration detected');

      // Get all multi channel nodes with device class generic: switch_multilevel
      const windowCoveringsSetMultiChannelNodeIds = this.getMultiChannelNodeIdsByDeviceClassGeneric(DEVICE_CLASS_GENERIC.SWITCH_MULTILEVEL);

      // Register windowcoverings_set on first SWITCH_MULTILEVEL multi channel node
      this.log('register windowcoverings_set on multi channel node id', windowCoveringsSetMultiChannelNodeIds[0]);
      this.registerCapability(CAPABILITIES.WINDOWCOVERINGS_SET, COMMAND_CLASSES.SWITCH_MULTILEVEL, {
        multiChannelNodeId: windowCoveringsSetMultiChannelNodeIds[0],
      });

      // Register windowcoverings_tilt_set on second SWITCH_MULTILEVEL multi channel node
      if (windowCoveringsSetMultiChannelNodeIds.length > 1) {
        this.log('register windowcoverings_tilt_set on multi channel node id', windowCoveringsSetMultiChannelNodeIds[1]);
        this.registerCapability(CAPABILITIES.WINDOWCOVERINGS_TILT_SET, COMMAND_CLASSES.SWITCH_MULTILEVEL, {
          multiChannelNodeId: windowCoveringsSetMultiChannelNodeIds[1],
        });
      } else {
        // Venetian blind mode disabled
        this.removeCapability(CAPABILITIES.WINDOWCOVERINGS_TILT_SET).catch(err => this.error(`Error removing ${CAPABILITIES.WINDOWCOVERINGS_TILT_SET} capability`, err));
      }
    } else {
      // No multi channel configuration
      this.log('no multi channel configuration');

      // Venetian blind mode disabled
      this.removeCapability(CAPABILITIES.WINDOWCOVERINGS_TILT_SET).catch(err => this.error(`Error removing ${CAPABILITIES.WINDOWCOVERINGS_TILT_SET} capability`, err));

      // Register windowcoverings_set on root node
      this.registerCapability(CAPABILITIES.WINDOWCOVERINGS_SET, COMMAND_CLASSES.SWITCH_MULTILEVEL);
    }
  }
}

module.exports = ZMNHCD;
