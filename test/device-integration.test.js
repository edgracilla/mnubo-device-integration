/* global describe, it, after, before */

'use strict'

const cp = require('child_process')
const should = require('should')
const amqp = require('amqplib')

let deviceSync = null
let _channel = {}
let _conn = null

describe('Device-integration', function () {
  this.slow(5000)

  let deviceId = `device-${Date.now() + 1}`

  before('init', () => {
    process.env.PLUGIN_ID = 'demo.dev-sync'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    process.env.MNUBO_ENV = 'sandbox'
    process.env.MNUBO_CLIENT_ID = 'tPlQIrCvgWQbKtVlwudDhVfHlVecScb4Yp3XxkHglkKoa4iW4W'
    process.env.MNUBO_CLIENT_SECRET = 'dLvvx7rRqfQCBeyhbaWJtAeGu94kwCnjsDedcQB7aM230JvKFW'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
        _channel = channel
      }).catch((err) => {
        console.log(err)
      })
  })

  after('terminate child process', function (done) {
    this.timeout(5000)

    setTimeout(() => {
      _conn.close()
      deviceSync.kill('SIGKILL')
      done()
    }, 4000)
  })

  describe('#spawn', function () {
    it('should spawn a child process', function () {
      should.ok(deviceSync = cp.fork(process.cwd()), 'Child process not spawned.')
    })
  })

  describe('#handShake', function () {
    it('should notify the parent process when ready within 5 seconds', function (done) {
      this.timeout(5000)

      deviceSync.on('message', function (message) {
        if (message.type === 'ready') {
          done()
        } else if (message.type === 'error') {
          console.log(message.data)
        }
      })
    })
  })

  describe('#adddevice', function () {
    it('should add the device', function (done) {
      this.timeout(5000)

      let dummyData = {
        operation: 'adddevice',
        device: {
          _id: deviceId,
          name: `dummy-${deviceId}`,
          metadata: {
            type: 'Thermostat Model 1'
          }
        }}

      _channel.sendToQueue(process.env.PLUGIN_ID, new Buffer(JSON.stringify(dummyData)))

      deviceSync.on('message', function (msg) {
        if (msg.type === 'adddevice' && msg.done) {
          done()
        }
      })
    })
  })

  describe('#updatedevice', function () {
    it('should update the device', function (done) {
      this.timeout(5000)

      let dummyData = {
        operation: 'updatedevice',
        device: {
          _id: deviceId,
          name: `dummy-${deviceId}`,
          metadata: {
            type: 'Thermostat Model 2'
          }
        }}

      _channel.sendToQueue(process.env.PLUGIN_ID, new Buffer(JSON.stringify(dummyData)))

      deviceSync.on('message', function (msg) {
        if (msg.type === 'updatedevice' && msg.done) {
          done()
        }
      })
    })
  })

  describe('#removedevice', function () {
    it('should remove the device', function (done) {
      this.timeout(5000)

      let dummyData = {
        operation: 'removedevice',
        device: { _id: deviceId }
      }

      _channel.sendToQueue(process.env.PLUGIN_ID, new Buffer(JSON.stringify(dummyData)))

      deviceSync.on('message', function (msg) {
        if (msg.type === 'removedevice' && msg.done) {
          done()
        }
      })
    })
  })
})
