import Validate from 'validate-arguments'

module.exports = bp => {
  return {
    bootstrap: () => {
      return bp.db.get()
      .then(initialize)
    },
    listAll: () => {
      return bp.db.get()
      .then(listAllSubscription)
    },
    create: (knex, category) => {
      return bp.db.get()
      .then(create)
    },
    modify: (knex, options) => {
      return bp.db.get()
      .then(modify)
    },
    delete: (knex, id) => {
      return bp.db.get()
      .then(remove)
    }
  }
}

function initialize(knex) {
  return knex.schema.createTableIfNotExists('subscriptions', function (table) {
    table.increments('id').primary()
    table.timestamp('created_on')
    table.string('category').unique()
    table.string('sub_keywords')
    table.string('unsub_keywords')
    table.string('sub_action')
    table.string('unsub_action')
    table.string('sub_action_type')
    table.string('unsub_action_type')
  })
  .then(function() {
    return knex.schema.createTableIfNotExists('subscription_users', function (table) {
      table.string('subscriptionId').references('subscriptions.id')
      table.string('userId').references('users.id')
      table.primary(['subscriptionId', 'userId'])
      table.timestamp('ts')
    })
  })
}

function listAllSubscription(knex) {
  return knex('subscriptions')
  .leftJoin('subscription_users', 'subscription_users.subscriptionId', 'subscriptions.id')
  .groupBy('subscription_users.subscriptionId')
  .select(knex.raw(`subscriptions.*, count(userId) as count`))
}

function create(knex, category) {
  if (typeof category !== 'string' || category.length < 1) {
    throw new Error('Category must be a valid string')
  }

  const upper = category.toUpperCase()

  return knex('subscriptions')
  .insert({
    category: category,
    sub_keywords: JSON.stringify(['SUBSCRIBE_' + upper]),
    unsub_keywords: JSON.stringify(['UNSUBSCRIBE_' + upper]),
    sub_action: 'Successfully subscribed to ' + category,
    sub_action_type: 'text',
    unsub_action: 'You are now unsubscribed from ' + category,
    unsub_action_type: 'text'
  })
}

function update(knex, options) {
  validateOptions(options)

  return knex('subscriptions')
  .where('id', options.id)
  .update({
    category: options.category,
    sub_keywords: JSON.stringify(options.sub_keywords),
    unsub_keywords: JSON.stringify(options.unsub_keywords),
    sub_action: options.sub_action,
    sub_action_type: options.sub_action_type,
    unsub_action: options.unsub_action,
    unsub_action_type: options.unsub_action_type
  })
}

function remove(knex, id) {
  return knex('subscription_users')
  .where('subscriptionId', id)
  .del()
  .then(() => {
    return knex('subscriptions')
    .where('id', id)
    .del()
  })
}

function validateOptions(options) {
  const args = Validate(options, {
    id: 'whole',
    category: 'string',
    sub_keywords: 'array',
    unsub_keywords: 'array',
    sub_action: 'string',
    unsub_action: 'string',
    sub_action_type: 'string',
    unsub_action_type: 'string'
  })

  if(!args.isValid()) {
    throw args.errorString()
  }
}
