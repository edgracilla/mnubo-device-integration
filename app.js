'use strict';

var get           = require('lodash.get'),
	platform      = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	mnuboClient;

var _addObject = function (device) {
	let type = get(device, 'metadata.type') || get(device, 'metadata.device_type') || 'rkhdevice';

	mnuboClient.objects
		.create({
			x_device_id: device._id,
			x_object_type: type
		})
		.then((object) => {
			platform.log(JSON.stringify({
				title: 'Device added to Mnubo.',
				data: object
			}));
		})
		.catch((error) => {
			platform.handleException(error);
		});
};

var _updateObject = function (device) {
	let type = get(device, 'metadata.type') || get(device, 'metadata.device_type') || 'rkhdevice';

	mnuboClient.objects
		.update(device._id, {
			x_object_type: type
		})
		.then((object) => {
			platform.log(JSON.stringify({
				title: 'Device updated on Mnubo.',
				data: object
			}));
		})
		.catch((error) => {
			platform.handleException(error);
		});
};

platform.on('adddevice', function (device) {
	if (isPlainObject(device)) {
		mnuboClient.objects
			.exists(device._id)
			.then((objects) => {
				if (objects[device._id])
					_updateObject(device);
				else
					_addObject(device);
			})
			.catch((error) => {
				platform.handleException(error);
			});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`));
});

platform.on('updatedevice', function (device) {
	if (isPlainObject(device)) {
		mnuboClient.objects
			.exists(device._id)
			.then((objects) => {
				if (objects[device._id])
					_updateObject(device);
				else
					_addObject(device);
			})
			.catch((error) => {
				platform.handleException(error);
			});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`));
});

platform.on('removedevice', function (device) {
	if (isPlainObject(device)) {
		mnuboClient.objects
			.delete(device._id)
			.then(function () {
				platform.log(JSON.stringify({
					title: 'Device removed from Mnubo.',
					data: device
				}));
			})
			.catch((error) => {
				platform.handleException(error);
			});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`));
});

platform.once('close', function () {
	platform.notifyClose();
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