const express = require('express')
const mongoose = require('mongoose')
const { ApolloServer } = require('apollo-server-express')

const { resolvers, typeDefs } = require('./src/schema/schema')
const {PORT, MONGO_DB_NAME, MONGO_DB_IP} = require('./src/config')

// Create app
const app = express()

const server = new ApolloServer({
  resolvers,
  typeDefs
})
server.applyMiddleware({app})

// Mongoose global config
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)

// Connect to mongo and start app
console.log('Connecting to database...')
mongoose.connect(`mongodb://${MONGO_DB_IP}/${MONGO_DB_NAME}`)
  .then(() => {
    console.log('Connected to mongo database')
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}.`)
      console.log(`🚀 server available at http://localhost:${PORT}${server.graphqlPath}`)
    })
  })
  .catch(err => console.error(`Failed to connect to database: ${err}`))
