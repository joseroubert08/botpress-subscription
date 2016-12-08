import path from 'path'
import fs from 'fs'
import _ from 'lodash'

import db from './db'

const loadConfigFromFile = filePath => {
  if (!fs.existsSync(filePath)) {
    const config = {
      manage_keywords: ['MANAGE_SUBSCRIPTIONS'],
      manage_action : 'To unsubscribe, type: UNSUBSCRIBE_<CATEGORY>. Categories are: {{categories}}',
      manage_type : 'text'
    }
    saveConfigToFile(config, filePath)
  }

  return JSON.parse(fs.readFileSync(filePath))
}

var saveConfigToFile = (config, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(config))
}

let subscriptions = null
let config = null
const incomingMiddleware = bp => (event, next) => {
  if (!subscriptions || !config) { 
    return next()
  }

  const categoriesText = subscriptions.map(s => s.category.toUpperCase()).join(', ')
  
  const executeAction = (type, action) => {
    if (type === 'text') {
      const txt = action.replace(/{{categories}}/ig, categoriesText)

      bp.middlewares.sendOutgoing({
        platform: event.platform,
        type: 'text',
        text: txt,
        raw: {
          to: event.user && event.user.id,
          message: txt
        }
      })
    } else {
      var fn = new Function('bp', 'event', 'userId', 'platform', action)
      fn(bp, event, event.user.id, event.platform)
    }
  }

  if (config && _.includes(config.manage_keywords, event.text)) {
    return executeAction(config.manage_type, config.manage_action)
  }

  next()
}

module.exports = {
  init: function(bp) {
    bp.middlewares.register({
      name: 'manage.subscriptions',
      type: 'incoming',
      handler: incomingMiddleware(bp),
      order: 15,
      module: 'botpress-subscription',
      description: 'Subscribes and unsubscribes users to the defined Subscriptions.'
    })

    db(bp).bootstrap()
    .then(db(bp).listAll)
    .then(subs => subscriptions = subs)
  },
  ready: function(bp) {
    const configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-subscription.json')
    config = loadConfigFromFile(configFile)

    const router = bp.getRouter('botpress-subscription')
    
    const updateSubs = () => {
      return db(bp).listAll()
      .then(subs => subscriptions = subs)
    }

    router.get('/config', (req, res) => {
      res.send(loadConfigFromFile(configFile))
    })

    router.post('/config', (req, res) => {
      saveConfigToFile(req.body, configFile)
      config = loadConfigFromFile(configFile)
      res.sendStatus(200)
    })

    router.get('/subscriptions', (req, res) => {
      db(bp).listAll()
      .then(subs => res.send(subs))
    })

    router.put('/subscriptions/:category', (req, res) => {
      db(bp).create(req.params.category)
      .then(() => res.sendStatus(200))
      .then(updateSubs)
    })

    router.post('/subscriptions/:id', (req, res) => {
      db(bp).modify(req.params.id, req.body)
      .then(() => res.sendStatus(200))
      .then(updateSubs)
    })

    router.delete('/subscriptions/:id', (req, res) => {
      db(bp).delete(req.params.id)
      .then(() => res.sendStatus(200))
      .then(updateSubs)
    })

  }
}
