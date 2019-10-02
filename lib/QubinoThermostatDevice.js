'use strict';

const Homey = require('homey');
const MeshDriverUtil = require('homey-meshdriver').Util;

const constants = require('./constants');
const QubinoDevice = require('./QubinoDevice');

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
    if (changedKeysArr.includes(constants.settings.antifreezeEnabled)) {

      let antifreezeValue = 255;
      if (newSettings[constants.settings.antifreezeEnabled]) {
        // Get value from newSettings if possible, else use stored setting value
        antifreezeValue = newSettings.hasOwnProperty(constants.settings.antifreeze) ? newSettings[constants.settings.antifreeze] : oldSettings[constants.settings.antifreeze];
      }

      if (!(constants.settings.antifreeze in changedKeysArr)) changedKeysArr.push(constants.settings.antifreeze);
      newSettings[constants.settings.antifreeze] = antifreezeValue;
    }

    return await super.onSettings(oldSettings, newSettings, changedKeysArr);
  }

  /**
   * Method that registers custom setting parsers.
   */
  registerSettings() {
    super.registerSettings();

    this.registerSetting(constants.settings.temperatureHysteresisOn, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(constants.settings.temperatureHysteresisOff, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(constants.settings.temperatureHeatingHysteresisOn, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(constants.settings.temperatureHeatingHysteresisOff, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(constants.settings.temperatureCoolingHysteresisOn, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(constants.settings.temperatureCoolingHysteresisOff, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -25.5, 1001, 1255, value);
    });

    this.registerSetting(constants.settings.antifreeze, value => {
      if (!value || value === 255) return value;
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -12.6, 1001, 1126, value);
    });

    this.registerSetting(constants.settings.tooLowTemperatureLimit, value => {
      if (value >= 0) return value * 10;
      return MeshDriverUtil.mapValueRange(-0.1, -15, 1001, 1150, value);
    });

    this.registerSetting(constants.settings.tooHighTemperatureLimit, value => value * 10);
  }

	/**
	 * Wrapper for execute capability set command from Flow card.
	 * @param value - mode ['auto'/'off']
	 * @returns {Promise<string|*>}
	 */
	setThermostatMode(value) {
		return this.executeCapabilitySetCommand(constants.capabilities.offAutoThermostatMode, constants.commandClasses.thermostatMode, value);
	}
}

module.exports = QubinoThermostatDevice;
