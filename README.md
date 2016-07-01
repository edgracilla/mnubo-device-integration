# Mnubo Device Integration
[![Build Status](https://travis-ci.org/Reekoh/mnubo-connector.svg)](https://travis-ci.org/Reekoh/mnubo-device-integration)
![Dependencies](https://img.shields.io/david/Reekoh/mnubo-device-integration.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/mnubo-device-integration.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Mnubo Device Integration Plugin for the Reekoh IoT Platform. Connects a Reekoh Instance with Mnubo to sync devices.

## Description
This plugin adds, updates and removes devices from Mnubo.

## Configuration
To configure this plugin, a Mnubo account is needed to provide the following:

1. Client ID - The Mnubo Client ID to use.
2. Client Secret - The Mnubo Client Secret to use.
3. Environment - The Mnubo account environment to use.

These parameters are then injected to the plugin from the platform.

## Sample input data for adding and updating devices
```
{
    device_id: 'Reekoh112233', //Mandatory
    device_type: 'drink' //Mandatory
}
```

## Sample input data for removing devices
```
{
    device_id: 'Reekoh112233', //Mandatory
}
```