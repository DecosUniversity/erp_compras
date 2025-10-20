const db = require('./db');

class DatabaseInitializer {
  static async initialize() {
    try {
      console.log('🔄 Inicializando base de datos...');

      // Verificar conexión antes de proceder
      await db.checkConnection();

      // 1. Crear tabla de proveedores si no existe
      await this.crearTablaProveedores();
      
      // 2. Crear tabla de órdenes de compra si no existe
      await this.crearTablaOrdenesCompra();
      
      // 3. Crear tabla de detalles de orden si no existe
      await this.crearTablaDetallesOrden();
      
      // 4. Crear triggers si no existen
      await this.crearTriggers();

      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error.message);
      // En lugar de hacer throw, continuamos sin la inicialización
      console.log('⚠️ La aplicación continuará sin inicialización de BD. Las tablas se crearán bajo demanda.');
    }
  }

  static async crearTablaProveedores() {
    const sql = `
      CREATE TABLE IF NOT EXISTS proveedores (
        id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        nit VARCHAR(20) NOT NULL,
        contacto VARCHAR(255) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        direccion TEXT NOT NULL,
        ciudad VARCHAR(100) NOT NULL,
        pais VARCHAR(100) NOT NULL DEFAULT 'Guatemala',
        estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
        fecha_registro TIMESTAMP NULL DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX uk_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    await db.execute(sql);
    console.log('✅ Tabla proveedores verificada/creada');
  }

  static async crearTablaOrdenesCompra() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ordenes_compra (
        id_orden_compra INT PRIMARY KEY AUTO_INCREMENT,
        id_proveedor INT NOT NULL,
        numero_orden VARCHAR(50) UNIQUE NOT NULL,
        fecha_orden DATE NOT NULL,
        fecha_entrega_esperada DATE NULL,
        estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'En proceso', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
        subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        impuestos DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        moneda ENUM('GTQ', 'USD') DEFAULT 'GTQ',
        terminos_pago VARCHAR(255) DEFAULT '30 días',
        observaciones TEXT NULL,
        creado_por INT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE RESTRICT,
        INDEX idx_estado (estado),
        INDEX idx_fecha_orden (fecha_orden),
        INDEX idx_proveedor (id_proveedor)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    await db.execute(sql);
    console.log('✅ Tabla ordenes_compra verificada/creada');
  }

  static async crearTablaDetallesOrden() {
    const sql = `
      CREATE TABLE IF NOT EXISTS detalles_orden_compra (
        id_detalle INT PRIMARY KEY AUTO_INCREMENT,
        id_orden_compra INT NOT NULL,
        id_producto INT NOT NULL,
        cantidad INT NOT NULL CHECK (cantidad > 0),
        precio_unitario DECIMAL(15,2) NOT NULL CHECK (precio_unitario >= 0),
        descuento DECIMAL(5,2) DEFAULT 0.00 CHECK (descuento >= 0 AND descuento <= 100),
        subtotal_linea DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        impuestos_linea DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total_linea DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        descripcion_producto VARCHAR(255) NULL,
        numero_linea INT NOT NULL,
        FOREIGN KEY (id_orden_compra) REFERENCES ordenes_compra(id_orden_compra) ON DELETE CASCADE,
        UNIQUE INDEX uk_orden_linea (id_orden_compra, numero_linea),
        INDEX idx_orden (id_orden_compra),
        INDEX idx_producto (id_producto)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    await db.execute(sql);
    console.log('✅ Tabla detalles_orden_compra verificada/creada');
  }

  static async crearTriggers() {
    // Eliminar triggers existentes primero para evitar duplicados
    await this.eliminarTriggersSiExisten();

    // Trigger 1: Cálculos automáticos para nuevos detalles
    const triggerInsert = `
      CREATE TRIGGER before_insert_detalles_orden
      BEFORE INSERT ON detalles_orden_compra
      FOR EACH ROW
      BEGIN
          -- Calcular subtotal de la línea
          SET NEW.subtotal_linea = NEW.cantidad * NEW.precio_unitario;
          
          -- Aplicar descuento si existe
          IF NEW.descuento > 0 THEN
              SET NEW.subtotal_linea = NEW.subtotal_linea - (NEW.subtotal_linea * NEW.descuento / 100);
          END IF;
          
          -- Calcular impuestos (12% IVA)
          SET NEW.impuestos_linea = NEW.subtotal_linea * 0.12;
          
          -- Calcular total de la línea
          SET NEW.total_linea = NEW.subtotal_linea + NEW.impuestos_linea;
      END
    `;

    // Trigger 2: Actualizar orden cuando se inserta detalle
    const triggerAfterInsert = `
      CREATE TRIGGER after_insert_detalles_orden
      AFTER INSERT ON detalles_orden_compra
      FOR EACH ROW
      BEGIN
          UPDATE ordenes_compra oc
          SET oc.subtotal = (
              SELECT COALESCE(SUM(subtotal_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = NEW.id_orden_compra
          ),
          oc.impuestos = (
              SELECT COALESCE(SUM(impuestos_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = NEW.id_orden_compra
          ),
          oc.total = (
              SELECT COALESCE(SUM(total_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = NEW.id_orden_compra
          )
          WHERE oc.id_orden_compra = NEW.id_orden_compra;
      END
    `;

    // Trigger 3: Actualizar orden cuando se actualiza detalle
    const triggerAfterUpdate = `
      CREATE TRIGGER after_update_detalles_orden
      AFTER UPDATE ON detalles_orden_compra
      FOR EACH ROW
      BEGIN
          UPDATE ordenes_compra oc
          SET oc.subtotal = (
              SELECT COALESCE(SUM(subtotal_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = NEW.id_orden_compra
          ),
          oc.impuestos = (
              SELECT COALESCE(SUM(impuestos_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = NEW.id_orden_compra
          ),
          oc.total = (
              SELECT COALESCE(SUM(total_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = NEW.id_orden_compra
          )
          WHERE oc.id_orden_compra = NEW.id_orden_compra;
      END
    `;

    // Trigger 4: Actualizar orden cuando se elimina detalle
    const triggerAfterDelete = `
      CREATE TRIGGER after_delete_detalles_orden
      AFTER DELETE ON detalles_orden_compra
      FOR EACH ROW
      BEGIN
          UPDATE ordenes_compra oc
          SET oc.subtotal = (
              SELECT COALESCE(SUM(subtotal_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = OLD.id_orden_compra
          ),
          oc.impuestos = (
              SELECT COALESCE(SUM(impuestos_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = OLD.id_orden_compra
          ),
          oc.total = (
              SELECT COALESCE(SUM(total_linea), 0) 
              FROM detalles_orden_compra 
              WHERE id_orden_compra = OLD.id_orden_compra
          )
          WHERE oc.id_orden_compra = OLD.id_orden_compra;
      END
    `;

    try {
      await db.execute(triggerInsert);
      console.log('✅ Trigger before_insert_detalles_orden creado');
      
      await db.execute(triggerAfterInsert);
      console.log('✅ Trigger after_insert_detalles_orden creado');
      
      await db.execute(triggerAfterUpdate);
      console.log('✅ Trigger after_update_detalles_orden creado');
      
      await db.execute(triggerAfterDelete);
      console.log('✅ Trigger after_delete_detalles_orden creado');
    } catch (error) {
      console.log('ℹ️ Los triggers ya existen o hubo un error menor:', error.message);
    }
  }

  static async eliminarTriggersSiExisten() {
    const triggers = [
      'before_insert_detalles_orden',
      'after_insert_detalles_orden',
      'after_update_detalles_orden',
      'after_delete_detalles_orden'
    ];

    for (const trigger of triggers) {
      try {
        await db.execute(`DROP TRIGGER IF EXISTS ${trigger}`);
      } catch (error) {
        // Ignorar errores si el trigger no existe
      }
    }
  }

  static async insertarDatosIniciales() {
    try {
      // Verificar si ya existen datos
      const [proveedores] = await db.execute('SELECT COUNT(*) as count FROM proveedores');
      
      if (proveedores[0].count === 0) {
        console.log('📝 Insertando datos iniciales...');
        
        // Insertar proveedores de ejemplo
        await db.execute(`
          INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, ciudad, pais) VALUES
          ('Proveedor Ejemplo S.A.', 'Juan Pérez', '33205976', 'contacto@proveedor.com', 'Calle Falsa 123', 'Ciudad de México', 'México'),
          ('Importadora La Economica S,A.', 'Pedro Perez', '55636363', 'contacto@laeconomica.com', 'Avenida Petapa, 23-06 Zona 12', 'Guatemala', 'Guatemala')
        `);

        console.log('✅ Datos iniciales insertados');
      }
    } catch (error) {
      console.log('ℹ️ Error insertando datos iniciales:', error.message);
    }
  }
}

module.exports = DatabaseInitializer;