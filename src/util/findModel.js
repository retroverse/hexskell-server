const hasTruthyProperty = (o) => Object.keys(o).map(key => !!o[key]).reduce((x, y) => x || y, false)

const identity = x => x

const removeFalsyProperties = (o) =>
  Object.fromEntries(
    Object.keys(o)
      .map(key => [key, o[key]])
      .filter(([k, v]) => v)
  )

const find = (model, args = {}, resolver = identity) => {
  let base
  if (hasTruthyProperty(args)) {
    base = model
      .find()
      .or(removeFalsyProperties(args))
  } else {
    base =
      model.find()
  }

  return base.map(x => x.map(resolver))
}

const findOne = (model, args = {}, resolver = identity) => {
  let base
  if (hasTruthyProperty(args)) {
    base = model
      .findOne()
      .or(removeFalsyProperties(args))
  } else {
    base =
      model.findOne()
  }

  return base.then(resolver)
}

module.exports = {find, findOne}
