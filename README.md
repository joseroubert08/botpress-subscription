# botpress-subscription

Provides an interface and APIs to manage user subscriptions to your bot.

**Supported connectors: ** All connectors that support the Text interface

<img src='/assets/screenshot.jpg' height='300px'>

## Get started

```
botpress install subscription
```

The subscription module should now be available in your bot UI, and the APIs exposed.

## Features

### Multi-subscriptions

Your bot can offer many categories of subscriptions, for example:
> `NEWSLETTER`, `ALERTS`, `DAILY_REMINDERS_9AM`, `DAILY_REMINDERS_6PM`

Your user can subscribe and unsubscribe to one or many of these subscriptions.

### Custom keywords to Subscribe and Unsubscribe to subscriptions

One or many keywords can be defined to automatically handle subscription and unsubscription. 

**Note**: Keywords must match excatly and are case sensitive. Keywords match on any event, whether it is text or quick_replies or postback for example.

To handle subscription and unsubscription manually, see the APIs below.

### Custom actions on Subscribed and Unsubscribed events

Variables exposed to the action functions:
- `bp` botpress instance
- `event` the original middleware event that triggered the action
- `userId` the userId to send the message to
- `platform` the platform on which the user is on

#### Example

```js
bp.messenger.sendText(eventId, `${event.user.first_name} thanks, you're subscribed`)
```


## API

### `GET /api/botpress-subscription/subscriptions`

Returns a list of all the subscriptions.

### `PUT /api/botpress-subscription/subscriptions/:category`

Create a new subscription.

### `POST /api/botpress-subscription/subscriptions/:id`

Update an existing subscription.

```js
{
  category: 'string', // *required*, the name of the subscription
  sub_keywords: 'array', // *required*, array of keywords (string)
  unsub_keywords: 'array', // *required*, array of keywords (string)
  sub_action: 'string', // *required*, the action, text or a javascript function
  unsub_action: 'string', // *required*, the action, text or a javascript function
  sub_action_type: 'string', // *required*, "text" or "javascript"
  unsub_action_type: 'string' // *required*, "text" or "javascript"
}
```

### `DELETE /api/botpress-subscription/subscriptions/:id`

Delete an existing subscription and also unsubscribes all the users subscribed to this subscription.

### `bp.subscribe(userId, category)` -> Promise

Subscribes a user to the subscription

### `bp.unsubscribe(userId, category)` -> Promise

Unsubscribes a user from the subscription

### `bp.isSubscribed(userId, category)` -> Promise(bool)

Subscribes a user to the subscription

### `bp.getSubscribed(userId)` -> Promise([categories...])

Returns a list of the categories the user is subscribed to

### Community

Pull requests are welcomed! We believe that it takes all of us to create something big and impactful.

We have a [Public Chatroom](https://gitter.im/botpress/core), everybody is invited to come and share ideas, issues or simply get in touch.

## License

botpress-subscription is licensed under [AGPL-3.0](/LICENSE)
