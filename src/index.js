module.exports = {
  init: function(bp) {

  },
  ready: function(bp) {


    bp.getRouter('botpress-subscriptions')
    .get('/subscriptions', (req, res) => {
      res.send([])
    })

  }
}
