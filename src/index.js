import db from './db'

module.exports = {
  init: function(bp) {

    return db(bp).bootstrap()

  },
  ready: function(bp) {


    bp.getRouter('botpress-subscriptions')
    .get('/subscriptions', (req, res) => {
      res.send([])
    })

  }
}
