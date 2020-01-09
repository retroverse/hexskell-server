module.exports = {
  PORT: process.env.PORT || 8080,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'test',
  MONGO_DB_IP: process.env.MONGO_DB_IP || 'localhost',
  HEXSKELL_IP: process.env.HEXSKELL_IP || 'localhost',
  HEXSKELL_PORT: process.env.HEXSKELL_PORT || 7000
}
