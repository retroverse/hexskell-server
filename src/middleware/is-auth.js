module.exports = (req, res, next) => {
  // #TODO: Actual authorisation
  req.isAuth = true
  req.userID = `5e1d3007883a000c566a668b`
  return next()
}
