const db = require('./db');

/**
 * Wrapper para ejecutar consultas con manejo de errores de conexión
 * @param {Function} queryFunction - Función que ejecuta la consulta
 * @param {number} retries - Número de reintentos
 * @returns {Promise} - Resultado de la consulta
 */
const executeWithRetry = async (queryFunction, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFunction();
    } catch (error) {
      console.log(`🔄 Error en consulta (intento ${i + 1}/${retries}):`, error.message);
      
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'ECONNRESET' || 
          error.code === 'ETIMEDOUT') {
        
        if (i === retries - 1) {
          console.error('❌ Se agotaron los reintentos para la consulta');
          throw new Error('Base de datos temporalmente no disponible. Intente nuevamente.');
        }
        
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // Si no es un error de conexión, lanzar inmediatamente
      throw error;
    }
  }
};

/**
 * Verificar si las tablas existen antes de ejecutar consultas
 * @param {string} tableName - Nombre de la tabla
 * @returns {Promise<boolean>} - True si la tabla existe
 */
const checkTableExists = async (tableName) => {
  try {
    const [rows] = await db.execute(
      `SELECT 1 FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );
    return rows.length > 0;
  } catch (error) {
    console.warn(`⚠️ No se pudo verificar la existencia de la tabla ${tableName}:`, error.message);
    return false;
  }
};

/**
 * Crear tabla si no existe (para uso bajo demanda)
 * @param {string} tableName - Nombre de la tabla
 * @param {string} createSQL - SQL para crear la tabla
 */
const ensureTableExists = async (tableName, createSQL) => {
  try {
    const exists = await checkTableExists(tableName);
    if (!exists) {
      console.log(`🔨 Creando tabla ${tableName}...`);
      await db.execute(createSQL);
      console.log(`✅ Tabla ${tableName} creada exitosamente`);
    }
  } catch (error) {
    console.error(`❌ Error creando tabla ${tableName}:`, error.message);
    throw error;
  }
};

module.exports = {
  db,
  executeWithRetry,
  checkTableExists,
  ensureTableExists
};