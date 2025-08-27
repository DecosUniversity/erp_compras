const mysql = require('mysql2');

console.log({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'analisis_dos',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306
});
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'analisis_dos',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306
});

module.exports = pool.promise(); // Para usar async/await