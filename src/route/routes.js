const express = require('express')

// Import routes
const botRoutes = require('./bots')

// Create router
const router = express.Router()

// Head request
router.all('/', (req, res) => res.send('Hexskell back end client'))

// Routes
router.use('/bots', botRoutes)

module.exports = router
