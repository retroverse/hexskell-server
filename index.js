const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const routes = require('./src/route/routes')
const {PORT, MONGO_DB_NAME, MONGO_DB_IP} = require('./src/config')

// Create app
const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/', routes)

// Mongoose global config
mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)

// Connect to mongo and start app
console.log('Connecting to database...')
mongoose.connect(`mongodb://${MONGO_DB_IP}/${MONGO_DB_NAME}`)
  .then(() => {
    console.log('Connected to mongo database')
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}.`)
    })
  })
  .catch(err => console.error(`Failed to connect to database: ${err}`))
