const merge = require('lodash.merge')

const bot = require('./bot')
const user = require('./user')

module.exports = merge(bot, user)
