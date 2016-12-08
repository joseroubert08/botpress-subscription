import path from 'path'
import fs from 'fs'

import db from './db'

const loadConfigFromFile = filePath => {
  if (!fs.existsSync(filePath)) {
    const config = {
      manage_keywords: ['MANAGE_SUBSCRIPTIONS'],
      manage_action : 'To unsubscribe, type: UNSUBSCRIBE_<CATEGORY>',
      manage_type : 'text'
    }
    saveConfigToFile(config, filePath)
  }

  return JSON.parse(fs.readFileSync(filePath))
}

var saveConfigToFile = (config, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(config))
}

module.exports = {
  init: function(bp) {
    return db(bp).bootstrap()
  },
  ready: function(bp) {
    const configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-subscription.json')

    const router = bp.getRouter('botpress-subscription')
    
    router.get('/config', (req, res) => {
      res.send(loadConfigFromFile(configFile))
    })

    router.post('/config', (req, res) => {
      saveConfigToFile(req.body, configFile)
      res.sendStatus(200)
    })

    router.get('/subscriptions', (req, res) => {
      db(bp).listAll()
      .then(subs => res.send(subs))
    })

    router.put('/subscriptions/:category', (req, res) => {
      db(bp).create(req.params.category)
      .then(() => res.sendStatus(200))
    })

    router.post('/subscriptions/:id', (req, res) => {
      db(bp).modify(req.params.id, req.body)
      .then(() => res.sendStatus(200))
    })

    router.delete('/subscriptions/:id', (req, res) => {
      db(bp).delete(req.params.id)
      .then(() => res.sendStatus(200))
    })

  }
}
