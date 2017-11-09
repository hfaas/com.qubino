'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZMNHDA2 extends ZwaveDevice {

	 onMeshInit() {

		// Register capabilities
		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');
		this.registerCapability('measure_power', 'METER');
		this.registerCapability('meter_power', 'METER');

		// Depends on whether temperature sensor is connected or not
		if (this.hasCommandClass('SENSOR_MULTILEVEL')) {
			this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		}

		// Invert value for this setting
		this.registerSetting('state_of_device_after_power_failure', value => new Buffer([!!value]));

		// Bind SENSOR_BINARY_REPORT listener on multichannel node 1
		this.registerMultiChannelReportListener(1, 'SENSOR_BINARY', 'SENSOR_BINARY_REPORT', report => {
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
		this.registerMultiChannelReportListener(2, 'SENSOR_BINARY', 'SENSOR_BINARY_REPORT', report => {
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

module.exports = ZMNHDA2;
