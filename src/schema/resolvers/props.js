const User = require('../../model/User')
const Bot = require('../../model/Bot')

const toQueryRes = obj => ({...obj._doc})
const resolveID = obj => ({...obj, id: obj._id})
const resolveDate = field => obj => ({...obj, [field]: (new Date(obj[field])).toISOString()})
const resolveLink = (field, model, resolver) => obj => ({
  ...obj, [field]: model.findById(obj[field]).then(resolver)
})
const resolveLinks = (field, model, resolver) => obj => ({
  ...obj, [field]: model.find({_id: {$in: obj[field]}}).map(x => x.map(resolver))
})

const resolveBot = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)
    .then(resolveDate('dateCreated'))
    .then(resolveLink('author', User, resolveUser))

const resolveUser = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)
    .then(resolveDate('dateJoined'))
    .then(resolveLinks('createdBots', Bot, resolveBot))

module.exports = { resolveBot, resolveUser }
