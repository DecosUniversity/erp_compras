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
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 60000,      // 60 segundos para establecer conexión
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  charset: 'utf8mb4'
});

// Función para verificar la conexión con reintentos
const checkConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.promise().execute('SELECT 1');
      console.log('✅ Conexión a la base de datos establecida exitosamente');
      return true;
    } catch (error) {
      console.log(`🔄 Intento ${i + 1}/${retries} falló. Reintentando en 3 segundos...`);
      if (i === retries - 1) {
        console.error('❌ No se pudo establecer conexión a la base de datos después de', retries, 'intentos');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// Manejo de errores del pool
pool.on('connection', (connection) => {
  console.log('🔗 Nueva conexión establecida como id ' + connection.threadId);
});

pool.on('error', (err) => {
  console.error('❌ Error en el pool de conexiones:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Intentando reconectar...');
  }
});

const dbPromise = pool.promise();
dbPromise.checkConnection = checkConnection;

module.exports = dbPromise;