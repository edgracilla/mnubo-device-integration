'use strict';

const CLIENT_ID = 'tPlQIrCvgWQbKtVlwudDhVfHlVecScb4Yp3XxkHglkKoa4iW4W',
    CLIENT_SECRET = 'dLvvx7rRqfQCBeyhbaWJtAeGu94kwCnjsDedcQB7aM230JvKFW',
    ENV = 'sandbox';

var cp     = require('child_process'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    deviceId = uuid.v4(),
    deviceIntegration;

describe('Device-integration', function () {
    this.slow(5000);

    after('terminate child process', function (done) {
        this.timeout(17000);
        setTimeout(function(){
            deviceIntegration.kill('SIGKILL');
            done();
        }, 16000);
    });

    describe('#spawn', function () {
        it('should spawn a child process', function () {
            assert.ok(deviceIntegration = cp.fork(process.cwd()), 'Child process not spawned.');
        });
    });

    describe('#handShake', function () {
        it('should notify the parent process when ready within 5 seconds', function (done) {
            this.timeout(5000);

            deviceIntegration.on('message', function (message) {
                if (message.type === 'ready')
                    done();
            });

            deviceIntegration.send({
                type: 'ready',
                data: {
                    options: {
                        client_id : CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        env : ENV
                    }
                }
            }, function (error) {
                assert.ifError(error);
            });
        });
    });

    describe('#adddevice', function () {
        it('should add the device', function (done) {
            deviceIntegration.send({
                type: 'adddevice',
                data: {
                    device_id: deviceId,
                    device_type: 'Beer'
                }
            }, done);
        });
    });

    setTimeout(() => {
        describe('#updatedevice', function () {
            it('should update the device', function (done) {
                deviceIntegration.send({
                    type: 'updatedevice',
                    data: {
                        device_id: deviceId,
                        device_type: 'Wine'
                    }
                }, done);
            });
        });
    }, 5000);

    setTimeout(() => {
        describe('#removedevice', function () {
            it('should remove the device', function (done) {
                deviceIntegration.send({
                    type: 'removedevice',
                    data: {
                        device_id: deviceId
                    }
                }, done);
            });
        });
    }, 5000);
});