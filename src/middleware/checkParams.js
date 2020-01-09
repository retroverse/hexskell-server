const checkParams = (type, required) => (req, res, next) => {
  const hasAllParams = required.every(param =>
    req[type][param]
  )

  if (hasAllParams) {
    next()
  } else {
    const params = required.map(p => '?' + p).join(', ')
    return res
      .status(401)
      .send('Requires parameters: ' + params)
  }
}

module.exports = checkParams
