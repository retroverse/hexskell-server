const express = require('express')

const Bot = require('../model/Bot')
const checkParams = require('../middleware/checkParams')

const router = express.Router()

// Get requests
router.get('/', (req, res) => {
  Bot.find(req.query).then(bots => res.send(JSON.stringify(bots)))
})

// Post requests
// #TODO: Run matches against pre-existing bots
router.post('/', checkParams('query', ['name', 'code']), (req, res) => {
  const {name, code} = req.query
  const bot = new Bot({name, code})
  bot.save()
    .then(() => res.send('Succesfully posted bot'))
    .catch(err => res.status(500).send(`Failed to post bot: ${err}`))
})

// Put Requests
router.put('/', checkParams('query', ['id']), (req, res) => {
  const {id, ...update} = req.query
  Bot
    .findById(id)
    .then(bot => {
      for (let key of Object.keys(update)) {
        if (key !== 'id') {
          bot[key] = update[key]
        }
      }
      return bot.save()
    })
    .then(_ => res.send('Succesfully updated bot.'))
    .catch(err => res.status(500).send(`Failed to update bot: ${err}`))
})

// Delete Requests
// #TODO: Remove all matches that include this bot
router.delete('/', checkParams('query', ['id']), (req, res) => {
  const {id} = req.query
  Bot
    .findById(id)
    .then(bot => bot.remove())
    .then(_ => res.send('Succesfully deleted bot'))
    .catch(err => res.status(500).send(`Failed to delete bot: ${err}`))
})

module.exports = router
