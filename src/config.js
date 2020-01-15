module.exports = {
  PORT: process.env.PORT || 8090,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'test',
  MONGO_DB_IP: process.env.MONGO_DB_IP || 'localhost',
  HEXSKELL_SERVER_ADDRESS: process.env.HEXSKELL_IP || '127.0.0.1',
  HEXSKELL_SERVER_PORT: process.env.HEXSKELL_PORT || 7000
}
