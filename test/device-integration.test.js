/* global describe, it, after, before */

'use strict'

const amqp = require('amqplib')
const should = require('should')
const cp = require('child_process')

const PLUGIN_ID = 'demo.dev-sync'
const BROKER = 'amqp://guest:guest@127.0.0.1/'

let conf = {
  env: 'sandbox',
  client_id: 'tPlQIrCvgWQbKtVlwudDhVfHlVecScb4Yp3XxkHglkKoa4iW4W',
  client_secret: 'dLvvx7rRqfQCBeyhbaWJtAeGu94kwCnjsDedcQB7aM230JvKFW'
}

let _app = null
let _conn = null
let _channel = null

describe('Mnubo Device Sync', function () {
  let deviceId = `device-${Date.now() + 1}`

  before('init', () => {
    process.env.BROKER = BROKER
    process.env.PLUGIN_ID = PLUGIN_ID
    process.env.CONFIG = JSON.stringify(conf)

    amqp.connect(BROKER).then((conn) => {
      _conn = conn
      return conn.createChannel()
    }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('terminate child process', function (done) {
    this.timeout(10000)

    _conn.close()
    setTimeout(() => {
      _app.kill('SIGKILL')
      done()
    }, 4000)
  })

  describe('#spawn', function () {
    it('should spawn a child process', function () {
      should.ok(_app = cp.fork(process.cwd()), 'Child process not spawned.')
    })
  })

  describe('#handShake', function () {
    it('should notify the parent process when ready within 5 seconds', function (done) {
      this.timeout(10000)

      _app.on('message', function (message) {
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
      this.timeout(10000)

      let dummyData = {
        operation: 'adddevice',
        device: {
          _id: deviceId,
          name: `dummy-${deviceId}`,
          metadata: {
            type: 'Thermostat Model 1'
          }
        }}

      _channel.sendToQueue(PLUGIN_ID, new Buffer(JSON.stringify(dummyData)))

      _app.on('message', function (msg) {
        if (msg.type === 'adddevice' && msg.done) {
          done()
        }
      })
    })
  })

  describe('#updatedevice', function () {
    it('should update the device', function (done) {
      this.timeout(10000)

      let dummyData = {
        operation: 'updatedevice',
        device: {
          _id: deviceId,
          name: `dummy-${deviceId}`,
          metadata: {
            type: 'Thermostat Model 2'
          }
        }
      }

      _channel.sendToQueue(PLUGIN_ID, new Buffer(JSON.stringify(dummyData)))

      _app.on('message', function (msg) {
        if (msg.type === 'updatedevice' && msg.done) {
          done()
        }
      })
    })
  })

  describe('#removedevice', function () {
    it('should remove the device', function (done) {
      this.timeout(10000)

      let dummyData = {
        operation: 'removedevice',
        device: { _id: deviceId }
      }

      _channel.sendToQueue(PLUGIN_ID, new Buffer(JSON.stringify(dummyData)))

      _app.on('message', function (msg) {
        if (msg.type === 'removedevice' && msg.done) {
          done()
        }
      })
    })
  })
})
