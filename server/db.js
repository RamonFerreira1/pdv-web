const mysql = require('mysql2/promise');
require('dotenv').config();

// SSL é necessário apenas para conexões com nuvem (ex: Aiven)
// Para Docker local, DB_SSL não é definido e SSL é desativado
const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pdv',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(sslConfig && { ssl: sslConfig }),
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err.message);
  });

module.exports = pool;
