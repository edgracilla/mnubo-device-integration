/* global describe, it, after, before */

'use strict'

const amqp = require('amqplib')
const should = require('should')

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

describe('Mnubo Inventory Sync', function () {
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

  after('terminate', function () {
    _conn.close()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      _app = require('../app')
      _app.once('init', done)
    })
  })

  describe('#adddevice', function () {
    it('should add the device', function (done) {
      this.timeout(10000)

      _channel.sendToQueue(PLUGIN_ID, new Buffer(JSON.stringify({
        operation: 'adddevice',
        device: {
          _id: deviceId,
          name: `dummy-${deviceId}`,
          metadata: {
            type: 'Thermostat Model 1'
          }
        }
      })))

      _app.on('ADD_OK', done)
    })
  })

  describe('#updatedevice', function () {
    it('should update the device', function (done) {
      this.timeout(10000)

      _channel.sendToQueue(PLUGIN_ID, new Buffer(JSON.stringify({
        operation: 'updatedevice',
        device: {
          _id: deviceId,
          name: `dummy-${deviceId}`,
          metadata: {
            type: 'Thermostat Model 2'
          }
        }
      })))

      _app.on('UPDATE_OK', done)
    })
  })

  describe('#removedevice', function () {
    it('should remove the device', function (done) {
      this.timeout(10000)

      _channel.sendToQueue(PLUGIN_ID, new Buffer(JSON.stringify({
        operation: 'removedevice',
        device: { _id: deviceId }
      })))

      _app.on('REMOVE_OK', done)
    })
  })
})
