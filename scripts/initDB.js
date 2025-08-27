const mysql = require('mysql2');

const initDatabase = async () => {
  try {
    console.log({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT
    });
    const connection = mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      port: process.env.MYSQLPORT
    });

    await connection.promise().query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.MYSQLDATABASE}`
    );
    
    console.log('Base de datos inicializada correctamente');
    connection.end();
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
  }
};

// Ejecutar si es el módulo principal
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;