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
    const config = loadConfigFromFile(configFile)

    bp.getRouter('botpress-subscriptions')
    .get('/subscriptions', (req, res) => {
      res.send([])
    })

  }
}
