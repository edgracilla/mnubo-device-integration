'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.InventorySync()

const get = require('lodash.get')
const mnubo = require('mnubo-sdk')
const isPlainObject = require('lodash.isplainobject')

let mnuboClient = null

let pushDevice = (action, device) => {
  let ret = null
  let type = get(device, 'metadata.type') || get(device, 'metadata.device_type') || 'rkhdevice'

  return new Promise((resolve, reject) => {
    if (action === 'add') {
      ret = mnuboClient.objects.create({
        x_device_id: device._id,
        x_object_type: type
      })
    } else if (action === 'upd') {
      ret = mnuboClient.objects.update(device._id, {
        x_object_type: type
      })
    } else {
      reject(new Error('pushDevice() action not specified'))
    }

    ret.then((object) => {
      return _plugin.log(JSON.stringify({
        title: 'Device added to Mnubo.',
        data: object
      }))
    }).then(() => {
      resolve()
    }).catch((error) => {
      reject(error)
    })
  })
}

_plugin.on('sync', () => {
  // no sync code from old version
})

_plugin.on('adddevice', (device) => {
  if (!isPlainObject(device)) {
    return _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`))
  }

  mnuboClient.objects.exists(device._id).then((objects) => {
    return objects[device._id]
      ? pushDevice('upd', device)
      : pushDevice('add', device)
  }).then(() => {
    process.send({ type: 'adddevice', done: true })
  }).catch((error) => {
    _plugin.logException(error)
  })
})

_plugin.on('updatedevice', (device) => {
  if (!isPlainObject(device)) {
    return _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`))
  }
  mnuboClient.objects.exists(device._id).then((objects) => {
    return objects[device._id]
      ? pushDevice('upd', device)
      : pushDevice('add', device)
  }).then(() => {
    process.send({ type: 'updatedevice', done: true })
  }).catch((error) => {
    _plugin.logException(error)
  })
})

_plugin.on('removedevice', (device) => {
  if (!isPlainObject(device)) {
    return _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`))
  }

  mnuboClient.objects.delete(device._id).then(() => {
    return _plugin.log(JSON.stringify({
      title: 'Device removed from Mnubo.',
      data: device
    }))
  }).then(() => {
    process.send({ type: 'removedevice', done: true })
  }).catch((error) => {
    _plugin.logException(error)
  })
})

_plugin.once('ready', () => {
  mnuboClient = new mnubo.Client({
    env: _plugin.config.env,
    id: _plugin.config.client_id,
    secret: _plugin.config.client_secret
  })

  _plugin.log('Device sync has been initialized.')
  process.send({ type: 'ready' })
})
