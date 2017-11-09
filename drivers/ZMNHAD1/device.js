'use strict';

const ZwaveMeteringDevice = require('homey-meshdriver').ZwaveMeteringDevice;

// TODO got stuck on multi channel association, device is reporting basic_set on all endpoints but only one is ending up in device.js

class ZMNHAD1 extends ZwaveMeteringDevice {

	onMeshInit() {

		this.printNode();
		this.enableDebug();

		const commandClassMultiChannel = this.node.CommandClass.COMMAND_CLASS_MULTI_CHANNEL;
		if (typeof commandClassMultiChannel === 'undefined') { return this.error('missing command class multi channel') }

		if (commandClassMultiChannel.type !== 'commandClassSupported') { return this.error('command class multi channel not supported') }

		if (commandClassMultiChannel.version < 2) { return this.error('command class multi channel version too low') }


		commandClassMultiChannel.commands.MULTI_CHANNEL_END_POINT_GET((err, result) => {
			if (err) return this.error('get multichannels failed');
			return this.log('got multichannels', result)
		});

		// Register capabilities
		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('measure_power', 'METER');
		this.registerCapability('meter_power', 'METER');

		// Depends on whether temperature sensor is connected or not
		if (this.hasCommandClass('SENSOR_MULTILEVEL')) {
			this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		}

		// Invert value for this setting
		this.registerSetting('state_of_device_after_power_failure', value => new Buffer([!!value]));

		// TODO?
		// Bind SENSOR_BINARY_REPORT listener on multichannel node 1
		this.registerMultiChannelReportListener(0, 'BASIC', 'BASIC_SET', report => {
			this.log(1, 'report', report);
			if (report['Sensor Value'] === 'detected an event') {
				return this.getDriver().flowTriggerDeviceMultiChannelNode[1].on.trigger(this).catch(err => {
					this.error('failed to trigger input 2 on', err);
				});
			} else if (report['Sensor Value'] === 'idle') {
				return this.getDriver().flowTriggerDeviceMultiChannelNode[1].off.trigger(this).catch(err => {
					this.error('failed to trigger input 2 off', err);
				});
			}
		});

		// Bind SENSOR_BINARY_REPORT listener on multichannel node 2
		this.registerMultiChannelReportListener(1, 'BASIC', 'BASIC_SET', report => {
			this.log(2, 'report', report);
			if (report['Sensor Value'] === 'detected an event') {
				return this.getDriver().flowTriggerDeviceMultiChannelNode[2].on.trigger(this).catch(err => {
					this.error('failed to trigger input 3 on', err);
				});
			} else if (report['Sensor Value'] === 'idle') {
				return this.getDriver().flowTriggerDeviceMultiChannelNode[2].off.trigger(this).catch(err => {
					this.error('failed to trigger input 3 off', err);
				});
			}
		});
	}
}

module.exports = ZMNHAD1;
