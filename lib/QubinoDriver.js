'use strict';

const Homey = require('homey');

const constants = require('./constants');

/**
 * This class extends Homey Driver and handles the registration and triggering of Flow cards for Qubino devices.
 */
class QubinoDriver extends Homey.Driver {

	/**
	 * Method that registers the Flow Cards of a Qubino device.
	 */
	onInit() {
		[{
			key: constants.flows.resetMeter,
			fn: this.resetMeterFlowAction,
		}].forEach(obj => {
			this._registerFlowCardAction(obj.key, obj.fn);
		});

		[
			constants.flows.inputOneToggled,
			constants.flows.inputOneTurnedOn,
			constants.flows.inputOneTurnedOff,
			constants.flows.inputTwoToggled,
			constants.flows.inputTwoTurnedOn,
			constants.flows.inputTwoTurnedOff,
			constants.flows.inputThreeToggled,
			constants.flows.inputThreeTurnedOn,
			constants.flows.inputThreeTurnedOff,
		].forEach(key => {
			this._registerFlowCardTriggerDevice(key);
		});

		// Register legacy flow cards
		[
			constants.flows.legacyInputOneTurnedOn,
			constants.flows.legacyInputOneTurnedOff,
			constants.flows.legacyInputTwoTurnedOn,
			constants.flows.legacyInputTwoTurnedOff,
			constants.flows.legacyInputThreeTurnedOn,
			constants.flows.legacyInputThreeTurnedOff,
		].forEach(key => {
			this._registerLegacyFlowCardTriggerDevice(key);
		})
	}

	_registerFlowCardAction(key, fn) {
		this.log('registerFlowCardAction()', key);
		if (!this.flowCardAction) this.flowCardAction = {};
		try {
			this.flowCardAction[key] = new Homey.FlowCardAction(`${key}_${this.id}`)
				.register()
				.registerRunListener(fn.bind(this));
		} catch (err) {
			// this.error(`failed to register flow card action ${key} for ${this.id}`, err.message);
		}
	}

	_registerFlowCardTriggerDevice(key) {
		this.log('registerFlowCardTriggerDevice()', key);
		if (!this.flowCardTriggerDevice) this.flowCardTriggerDevice = {};
		try {
			this.flowCardTriggerDevice[key] = new Homey.FlowCardTriggerDevice(`${key}_${this.id}`).register();
		} catch (err) {
			// this.error(`failed to register flow card trigger device ${key} for ${this.id}`, err.message);
		}
	}

	_registerLegacyFlowCardTriggerDevice(key) {
		this.log('_registerLegacyFlowCardTriggerDevice()', key);
		if (!this.flowCardTriggerDevice) this.flowCardTriggerDevice = {};
		try {
			this.flowCardTriggerDevice[key] = new Homey.FlowCardTriggerDevice(`${this.id}_${key}`).register();
		} catch (err) {
			// this.error(`failed to register flow card trigger device ${key} for ${this.id}`, err.message);
		}
	}

	/**
	 * Flow Action handler that will reset the accumulated meter power on the device.
	 * @param args
	 * @returns {Promise<*>}
	 */
	async resetMeterFlowAction(args) {
		if (args && args.device) {
			if (typeof args.device.resetMeter === 'function') {
				return args.device.resetMeter();
			}
			return Promise.reject(new Error('device_does_not_support_meter_reset'));
		}
		return Promise.reject(new Error('missing_device_instance'));
	}

	/**
	 * Method that triggers a Flow from a device instance.
	 * @param flowId
	 * @param device
	 * @param tokens
	 * @param state
	 * @returns {Promise<void>}
	 */
	async triggerFlow(flowId, device, tokens = {}, state = {}) {
		if (!flowId) return this.error('flow id is undefined:', flowId);
		if (!device || !(device instanceof Homey.Device)) return this.error('missing device argument for flow:', flowId);
		if (!this.flowCardTriggerDevice.hasOwnProperty(flowId)) return this.error(`flow is not registered: ${flowId}`);
		try {
			this.log('trigger flow', flowId, tokens, state);
			await this.flowCardTriggerDevice[flowId].trigger(device, tokens, state);
		} catch (err) {
			this.error(`flow failed to trigger, reason: ${err.message}`);
		}
	}
}

module.exports = QubinoDriver;
