const express = require('express')
const mongoose = require('mongoose')

const {PORT, MONGO_DB_NAME, MONGO_DB_IP} = require('./config')

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

mongoose.connect(`mongodb://${MONGO_DB_IP}/${MONGO_DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to mongo database')
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}.`)
    })
  })
