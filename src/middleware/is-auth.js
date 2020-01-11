module.exports = (req, res, next) => {
  // #TODO: Actual authorisation
  req.isAuth = true
  req.userID = `5e19b8415a9de794a225ab7b`
  return next()
}
