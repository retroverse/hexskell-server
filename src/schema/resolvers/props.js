const toQueryRes = obj => ({...obj._doc})
const resolveID = obj => ({...obj, id: obj._id})
const resolveDate = field => obj => ({...obj, [field]: (new Date(obj[field])).toISOString()})

const resolveBot = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)

const resolveUser = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)
    .then(resolveDate('dateJoined'))

module.exports = { resolveBot, resolveUser }
