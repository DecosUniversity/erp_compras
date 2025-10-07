const db = require('../config/db');

class OrdenCompra {
  // Crear una nueva orden de compra
  static async crear(ordenData) {
    const {
      id_proveedor, numero_orden, fecha_orden, fecha_entrega_esperada,
      estado, moneda, terminos_pago, observaciones, creado_por
    } = ordenData;

    const [result] = await db.execute(
      `INSERT INTO ordenes_compra 
       (id_proveedor, numero_orden, fecha_orden, fecha_entrega_esperada, 
        estado, moneda, terminos_pago, observaciones, creado_por) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_proveedor, numero_orden, fecha_orden, fecha_entrega_esperada,
       estado, moneda, terminos_pago, observaciones, creado_por]
    );

    return result.insertId;
  }

  // Obtener todas las órdenes
  static async obtenerTodas() {
    const [rows] = await db.execute(`
      SELECT oc.*, p.nombre as nombre_proveedor, p.contacto as contacto_proveedor
      FROM ordenes_compra oc
      JOIN proveedores p ON oc.id_proveedor = p.id_proveedor
      ORDER BY oc.fecha_creacion DESC
    `);
    return rows;
  }

  // Obtener orden por ID
  static async obtenerPorId(id_orden_compra) {
    const [rows] = await db.execute(`
      SELECT oc.*, p.nombre as nombre_proveedor, p.contacto, p.telefono, p.email,
             p.direccion as direccion_proveedor, p.ciudad, p.pais
      FROM ordenes_compra oc
      JOIN proveedores p ON oc.id_proveedor = p.id_proveedor
      WHERE oc.id_orden_compra = ?
    `, [id_orden_compra]);

    return rows[0];
  }

  // Actualizar orden
  static async actualizar(id_orden_compra, ordenData) {
    const {
      estado, fecha_entrega_esperada, observaciones
    } = ordenData;

    const [result] = await db.execute(
      `UPDATE ordenes_compra 
       SET estado = ?, fecha_entrega_esperada = ?, observaciones = ?
       WHERE id_orden_compra = ?`,
      [estado, fecha_entrega_esperada, observaciones, id_orden_compra]
    );

    return result.affectedRows;
  }

  // Eliminar orden
  static async eliminar(id_orden_compra) {
    const [result] = await db.execute(
      'DELETE FROM ordenes_compra WHERE id_orden_compra = ?',
      [id_orden_compra]
    );
    return result.affectedRows;
  }
}

module.exports = OrdenCompra;