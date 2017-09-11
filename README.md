# Qubino

This app adds support for Qubino Z-Wave modules in Homey.

### Changelog

Version 1.1.6
* Minor bug fixes for dimming duration setting (parameter 66) for ZMNHVD1, ZMNHSD1 and ZMNHDA2

Version 1.1.0
* Add support for ZMNHDD1 (Flush Dimmer)
* Add support for ZMNHBD1 (Flush 2 Relays)
* Add support for ZMNHAD1 (Flush 1 Relay)
* Add support for ZMNHDA2 (Flush Dimmer)
* Add support for ZMNHND1 (Flush 1D Relay)
* Add support for ZMNHVD1 (Flush Dimmer 0 - 10V)
* Add support for ZMNHKD1 (Flush Heat & Cool Thermostat)
* Add support for ZMNHIA2 (Flush On/Off Thermostat)
* Add support for ZMNHTD1 (Smart Meter)
* Add support for ZMNHSD1 (DIN Dimmer)
* Known limitations:
    * ZMNHDD1 (Flush Dimmer): input 2 and 3 can not be used in Flows
    * ZMNHBD1 (Flush 2 Relays): 
        * input 1 and 2 can not be used in Flows
        * power consumption for multichannel nodes not reporting
        * on/off state for multichannel nodes not reporting
    * ZMNHAD1 (Flush 1 Relay): input 2 and 3 can not be used in Flows
    * ZMNHKD1 (Flush Heat & Cool Thermostat): input 2 and 3 can not be used in Flows
    * ZMNHIA2 (Flush On/Off Thermostat): input 2 and 3 can not be used in Flows
    * ZMNHSD1 (DIN Dimmer): input 1 can not be used in Flows
