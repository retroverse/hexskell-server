const express = require('express')
const { OAuth2Client } = require('google-auth-library')

const User = require('../model/User')
const { GOOGLE_CLIENT_ID } = require('../config')

// Create auth router
const router = express.Router()

// Create google auth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

const verifyToken = async token => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  return payload
}

const setupSession = async (payload, req) => {
  console.log('Creating auth session')

  // Get the google user id
  const googleID = payload.sub

  // Does a user exist with this google user id?
  const user = await User.findOne({ googleID })
  let toLogin = user

  // Create user?
  let registeredNewUser = false
  if (!user) {
    // Create this user
    console.log(`User with gID ${googleID} doesnt exist yet, creating user...`)

    // Create user doc
    const newUser = new User({
      googleID,
      displayName: payload.name // Temporary -> can be changed by user
    })

    // Save to db
    registeredNewUser = true
    toLogin = await newUser.save()
  }

  // Add information to session
  req.session.userID = toLogin.id
  req.session.isAuth = true

  return {
    registeredNewUser
  }
}

router.post('/login', async (req, res) => {
  // Get token from request
  const { token } = req.query
  if (!token) {
    console.log('Bad request')
    res.status(400).send('Requires "token" query parameter')
    return
  }

  // Parse token
  let payload
  try {
    payload = await verifyToken(token)
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message, message: 'Failed to verify token' })
    return
  }

  // Setup session
  let sessionInformation
  try {
    sessionInformation = await setupSession(payload, req)
  } catch (error) {
    res.status(500).json({ success: false, error, message: 'Failed to setup session' })
    return
  }

  // Response
  res.status(200).json({ success: true, ...sessionInformation })
})

module.exports = router
