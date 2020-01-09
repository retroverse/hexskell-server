const hasTruthyProperty = (o) => Object.keys(o).map(key => !!o[key]).reduce((x, y) => x || y)

const find = (model, args) => {
  if (hasTruthyProperty(args)) {
    return model.find(args)
  } else {
    return model.find()
  }
}

module.exports = find
