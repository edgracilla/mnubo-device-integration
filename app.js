'use strict';

var platform = require('./platform'),
    isPlainObject = require('lodash.isplainobject'),
    mnuboClient;


platform.on('adddevice', function(device) {
    if(isPlainObject(device)){
        mnuboClient.objects
            .create({
                x_device_id: device.device_id,
                x_object_type: device.device_type
            })
            .then(function(object) {
                console.log(object);
                platform.log(JSON.stringify({
                    title: 'Device added to Mnubo.',
                    data: object
                }));
            })
            .catch((error) => {
                console.error(error);
                platform.handleException(error);
            });
    }
    else
        platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`));
});

platform.on('updatedevice', function(device) {
    if(isPlainObject(device)){
        mnuboClient.objects
            .update(device.device_id, {
                x_object_type: device.device_type
            })
            .then(function() {
                platform.log(JSON.stringify({
                    title: 'Device updated on Mnubo.',
                    data: 'Device successfully updated.'
                }));
            })
            .catch((error) => {
                console.error(error);
                platform.handleException(error);
            });
    }
    else
        platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`));
});

platform.on('removedevice', function(device) {
    if(isPlainObject(device)){
        mnuboClient.objects
            .delete(device.device_id)
            .then(function() {
                platform.log(JSON.stringify({
                    title: 'Device removed from Mnubo.',
                    data: 'Device successfully removed.'
                }));
            })
            .catch((error) => {
                console.error(error);
                platform.handleException(error);
            });
    }
    else
        platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`));
});

platform.once('close', function () {
    let d = require('domain').create();

    d.once('error', function (error) {
        console.error(error);
        platform.handleException(error);
        platform.notifyClose();
        d.exit();
    });

    d.run(function () {
        // TODO: Release all resources and close connections etc.
        platform.notifyClose(); // Notify the platform that resources have been released.
        d.exit();
    });
});

platform.once('ready', function (options) {
    var mnubo = require('mnubo-sdk');

    mnuboClient = new mnubo.Client({
        id: options.client_id,
        secret: options.client_secret,
        env: options.env
    });

    platform.notifyReady();
    platform.log('Mnubo Device integration has been initialized.');
});