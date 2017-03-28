'use strict'

const reekoh = require('reekoh')
const plugin = new reekoh.plugins.InventorySync()

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
      return plugin.log(JSON.stringify({
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

plugin.on('sync', () => {
  // no sync code from old version
})

plugin.on('adddevice', (device) => {
  if (!isPlainObject(device)) {
    return plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`))
  }

  mnuboClient.objects.exists(device._id).then((objects) => {
    return objects[device._id]
      ? pushDevice('upd', device)
      : pushDevice('add', device)
  }).then(() => {
    plugin.emit('ADD_OK')
  }).catch((error) => {
    plugin.logException(error)
    console.log(error)
  })
})

plugin.on('updatedevice', (device) => {
  if (!isPlainObject(device)) {
    return plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`))
  }
  mnuboClient.objects.exists(device._id).then((objects) => {
    return objects[device._id]
      ? pushDevice('upd', device)
      : pushDevice('add', device)
  }).then(() => {
    plugin.emit('UPDATE_OK')
  }).catch((error) => {
    plugin.logException(error)
    console.log(error)
  })
})

plugin.on('removedevice', (device) => {
  if (!isPlainObject(device)) {
    return plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${device}`))
  }

  mnuboClient.objects.delete(device._id).then(() => {
    return plugin.log(JSON.stringify({
      title: 'Device removed from Mnubo.',
      data: device
    }))
  }).then(() => {
    plugin.emit('REMOVE_OK')
  }).catch((error) => {
    plugin.logException(error)
    console.log(error)
  })
})

plugin.once('ready', () => {
  mnuboClient = new mnubo.Client({
    env: plugin.config.env,
    id: plugin.config.client_id,
    secret: plugin.config.client_secret
  })

  plugin.log('Device sync has been initialized.')
  plugin.emit('init')
})

module.exports = plugin
