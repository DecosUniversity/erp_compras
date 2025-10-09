const db = require('../config/db');

class DetalleOrden {
  // Agregar producto a orden
  static async agregarProducto(detalleData) {
    const {
      id_orden_compra, id_producto, cantidad, precio_unitario,
      descuento, descripcion_producto, numero_linea
    } = detalleData;

    const [result] = await db.execute(
      `INSERT INTO detalles_orden_compra 
       (id_orden_compra, id_producto, cantidad, precio_unitario, 
        descuento, descripcion_producto, numero_linea) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_orden_compra, id_producto, cantidad, precio_unitario,
       descuento, descripcion_producto, numero_linea]
    );

    return result.insertId;
  }

  // Obtener detalles de una orden
  static async obtenerPorOrden(id_orden_compra) {
    const [rows] = await db.execute(`
      SELECT doc.*
      FROM detalles_orden_compra doc
      WHERE doc.id_orden_compra = ?
      ORDER BY doc.numero_linea
    `, [id_orden_compra]);

    return rows;
  }

  // Actualizar detalle
  static async actualizar(id_detalle, detalleData) {
    const { cantidad, precio_unitario, descuento } = detalleData;

    const [result] = await db.execute(
      `UPDATE detalles_orden_compra 
       SET cantidad = ?, precio_unitario = ?, descuento = ?
       WHERE id_detalle = ?`,
      [cantidad, precio_unitario, descuento, id_detalle]
    );

    return result.affectedRows;
  }

  // Eliminar detalle
  static async eliminar(id_detalle) {
    const [result] = await db.execute(
      'DELETE FROM detalles_orden_compra WHERE id_detalle = ?',
      [id_detalle]
    );
    return result.affectedRows;
  }
}

module.exports = DetalleOrden;