module.exports = (req, res, next) => {
  // #TODO: Actual authorisation
  req.isAuth = true
  req.userID = `5e1ed8836ac5a337f85990de`
  return next()
}
