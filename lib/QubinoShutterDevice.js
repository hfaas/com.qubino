'use strict';

const Homey = require('homey');

const QubinoDevice = require('./QubinoDevice');
const { CAPABILITIES, SETTINGS } = require('./constants');

/**
 * This class extends QubinoDevice and adds some Qubino Shutter device functionality, such as a custom save message
 * which indicates that the device needs to be re-paired after changing it, a calibration method, and a method that
 * handles tilt set commands when they are unsupported.
 */
class QubinoShutterDevice extends QubinoDevice {
  /**
   * When venetian blind mode setting was changed notify user of the need to re-pair.
   * @param oldSettings
   * @param newSettings
   * @param changedKeysArr
   * @returns {{en: string, nl: string}}
   */
  customSaveMessage(oldSettings, newSettings, changedKeysArr = []) {
    if (changedKeysArr.includes(SETTINGS.OPERATING_MODE)) {
      return Homey.__('settings.re_pair_required');
    }
    return super.customSaveMessage();
  }

  /**
   * Override onSettings to invert the capability values when the invert settigns are changed.
   * @param oldSettings
   * @param newSettings
   * @param changedKeysArr
   * @returns {Promise<T>}
   */
  async onSettings(oldSettings, newSettings, changedKeysArr) {
    // Check if one of the invert settings changed if so invert the capability value
    if (changedKeysArr.includes(SETTINGS.INVERT_WINDOW_COVERINGS_TILT_DIRECTION)
      && this.hasCapability(CAPABILITIES.WINDOWCOVERINGS_TILT_SET)) {
      this.setCapabilityValue(CAPABILITIES.WINDOWCOVERINGS_TILT_SET, 1 - this.getCapabilityValue(CAPABILITIES.WINDOWCOVERINGS_TILT_SET));
    }
    if (changedKeysArr.includes(SETTINGS.INVERT_WINDOW_COVERINGS_DIRECTION)
      && this.hasCapability(CAPABILITIES.DIM)) {
      this.setCapabilityValue(CAPABILITIES.DIM, 1 - this.getCapabilityValue(CAPABILITIES.DIM));
    }

    return super.onSettings(oldSettings, newSettings, changedKeysArr);
  }

  /**
   * Method that handles the parsing of many shared settings.
   */
  registerSettings() {
    // Multiply motor operation detection by 10
    this.registerSetting(SETTINGS.MOTOR_OPERATION_DETECTION, value => value * 10);

    // Multiply slats tilting time by 100
    this.registerSetting(SETTINGS.SLATS_TILTING_TIME, value => value * 100);

    // Multiply motor moving time by 10
    this.registerSetting(SETTINGS.MOTOR_MOVING_TIME, value => value * 10);

    // Multiply power report delay time by 10
    this.registerSetting(SETTINGS.POWER_REPORT_DELAY_TIME, value => value * 10);

    // Multiply delay between motor movement by 10
    this.registerSetting(SETTINGS.DELAY_BETWEEN_MOTOR_MOVEMENT, value => value * 10);

    // Multiply motor off delay limit switch by 10
    this.registerSetting(SETTINGS.MOTOR_OFF_DELAY_LIMIT_SWITCH, value => value * 10);
  }
}

module.exports = QubinoShutterDevice;
