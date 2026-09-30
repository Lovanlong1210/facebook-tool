const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const sql = require('mssql/msnodesqlv8');

const dbServer = process.env.DB_SERVER;
const dbName = process.env.DB_NAME;
if (!dbServer || !dbName) {
  throw new Error('DB_SERVER và DB_NAME cần được khai báo trong server/.env');
}

const credentials = process.env.DB_USER && process.env.DB_PASSWORD
  ? `UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD};`
  : 'Trusted_Connection=Yes;';

const sqlConfig = {
  connectionString:
    `Driver={${process.env.DB_DRIVER || 'ODBC Driver 17 for SQL Server'}};` +
    `Server=${dbServer};` +
    `Database=${dbName};` +
    credentials +
    'TrustServerCertificate=Yes;',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(sqlConfig)
      .connect()
      .then((pool) => {
        console.log('[SQL Server] Kết nối thành công!');
        return pool;
      })
      .catch((error) => {
        poolPromise = null;
        console.error('[SQL Server Error]');
        console.dir(error, { depth: null });
        throw error;
      });
  }

  return poolPromise;
}

module.exports = {
  sql,
  getPool,
  redisConfig
};