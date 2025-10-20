const pool = require('../config/db');

// Obtener todos los proveedores
exports.getAllProveedores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un proveedor por ID
exports.getProveedorById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id_proveedor = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo proveedor
exports.createProveedor = async (req, res) => {
  try {
    const { nombre, nit, contacto, telefono, email, direccion, ciudad, pais, estado } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion, ciudad, pais, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, nit, contacto, telefono, email, direccion, ciudad, pais, estado || 'Activo']
    );
    
    const [newRow] = await pool.query('SELECT * FROM proveedores WHERE id_proveedor = ?', [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un proveedor
exports.updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit, contacto, telefono, email, direccion, ciudad, pais, estado } = req.body;
    
    const [result] = await pool.query(
      'UPDATE proveedores SET nombre = ?, nit = ?, contacto = ?, telefono = ?, email = ?, direccion = ?, ciudad = ?, pais = ?, estado = ? WHERE id_proveedor = ?',
      [nombre, nit, contacto, telefono, email, direccion, ciudad, pais, estado, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    
    const [updatedRow] = await pool.query('SELECT * FROM proveedores WHERE id_proveedor = ?', [id]);
    res.json(updatedRow[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un proveedor (cambiar estado a Inactivo)
exports.deleteProveedor = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE proveedores SET estado = "Inactivo" WHERE id_proveedor = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminación física de un proveedor (opcional)
exports.hardDeleteProveedor = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM proveedores WHERE id_proveedor = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};