'use strict';

const { Util } = require('homey-meshdriver');

const QubinoDevice = require('./QubinoDevice');
const { CAPABILITIES, COMMAND_CLASSES, SETTINGS } = require('./constants');

/**
 * This class adds basic functionality related Qubino devices supporting dimming (mostly lights), it handles setting
 * min/max dimming values.
 */
class QubinoThermostatDevice extends QubinoDevice {

  /**
   * Override onSettings to handle combined z-wave settings.
   * @param oldSettings
   * @param newSettings
   * @param changedKeysArr
   * @returns {Promise<T>}
   */
  async onSettings(oldSettings, newSettings, changedKeysArr) {

    // If enabled/disabled
    if (changedKeysArr.includes(SETTINGS.ANTIFREEZE_ENABLED)) {

      let antifreezeValue = 255;
      if (newSettings[SETTINGS.ANTIFREEZE_ENABLED]) {
        // Get value from newSettings if possible, else use stored setting value
        antifreezeValue = newSettings.hasOwnProperty(SETTINGS.ANTIFREEZE) ? newSettings[SETTINGS.ANTIFREEZE] : oldSettings[SETTINGS.ANTIFREEZE];
      }

      if (!(SETTINGS.ANTIFREEZE in changedKeysArr)) changedKeysArr.push(SETTINGS.ANTIFREEZE);
      newSettings[SETTINGS.ANTIFREEZE] = antifreezeValue;
    }

    return await super.onSettings(oldSettings, newSettings, changedKeysArr);
  }

  /**
   * Method that registers custom setting parsers.
   */
  registerSettings() {
    super.registerSettings();

    this.registerSetting(SETTINGS.TEMPERATURE_HYSTERESIS_ON, value => {
      if (value >= 0) return value * 10;
      return Util.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(SETTINGS.TEMPERATURE_HYSTERESIS_OFF, value => {
      if (value >= 0) return value * 10;
      return Util.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(SETTINGS.ANTIFREEZE, value => {
      if (!value || value === 255) return value;
      if (value >= 0) return value * 10;
      return Util.mapValueRange(-0.1, -12.6, 1001, 1126, value);
    });

    this.registerSetting(SETTINGS.TOO_LOW_TEMPERATURE_LIMIT, value => {
      if (value >= 0) return value * 10;
      return Util.mapValueRange(-0.1, -15, 1001, 1150, value);
    });

    this.registerSetting(SETTINGS.TOO_HIGH_TEMPERATURE_LIMIT, value => value * 10);
  }

	/**
	 * Wrapper for execute capability set command from Flow card.
	 * @param value - mode ['auto'/'off']
	 * @returns {Promise<string|*>}
	 */
	setThermostatMode(value) {
		return this.executeCapabilitySetCommand(CAPABILITIES.OFF_AUTO_THERMOSTAT_MODE, COMMAND_CLASSES.THERMOSTAT_MODE, value);
	}
}

module.exports = QubinoThermostatDevice;
