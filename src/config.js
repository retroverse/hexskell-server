require('dotenv').config()

module.exports = {
  PORT: process.env.PORT || 8090,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'test',
  MONGO_DB_IP: process.env.MONGO_DB_IP || 'localhost',
  HEXSKELL_SERVER_ADDRESS: process.env.HEXSKELL_SERVER_ADDRESS || '127.0.0.1',
  HEXSKELL_SERVER_PORT: process.env.HEXSKELL_SERVER_PORT || 7000,
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  FRONT_END_HOST: process.env.FRONT_END_HOST || 'localhost:1234'
}
