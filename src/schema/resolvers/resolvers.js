const merge = require('lodash.merge')

const bot = require('./bot')
const user = require('./user')
const match = require('./match')

module.exports = merge(bot, user, match)
