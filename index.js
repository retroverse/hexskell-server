const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const { resolvers, typeDefs } = require('./src/schema/schema')
const { PORT, MONGO_DB_NAME, MONGO_DB_IP, SESSION_SECRET, FRONT_END_HOST } = require('./src/config')
const authRoute = require('./src/routes/auth')
const { beginPublishChecks } = require('./src/publishing')

// Create app
const app = express()

// Apply middleware
app.use(cors({
  origin: `http://${FRONT_END_HOST}`,
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Setup sessions
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  cookie: {
    httpOnly: false
  },
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Create auth route
app.use('/auth', authRoute)

// Use apollo-server middleware
const server = new ApolloServer({
  resolvers,
  typeDefs,
  context: ({ req }) => req.session
})
server.applyMiddleware({ app, cors: false, bodyParserConfig: false })

// Mongoose global config
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)

// Connect to mongo and start app
console.log('Connecting to database...')
mongoose.connect(`mongodb://${MONGO_DB_IP}/${MONGO_DB_NAME}`)
  .catch(err => console.error(`Failed to connect to database: ${err}`))
  .then(() => {
    console.log('Connected to mongo database')
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}.`)
      console.log(`🚀 server available at http://localhost:${PORT}${server.graphqlPath}`)

      // Begin periodic checks to check if bots need publishing and then run tournaments
      beginPublishChecks(10000)
    })
  })
