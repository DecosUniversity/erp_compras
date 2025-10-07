const express = require('express');
const router = express.Router();
const OrdenCompra = require('../models/ordenCompra');
const DetalleOrden = require('../models/detalleOrden');

// GET /api/ordenes-compra - Obtener todas las órdenes
router.get('/', async (req, res) => {
  try {
    const ordenes = await OrdenCompra.obtenerTodas();
    res.json({ success: true, data: ordenes });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener órdenes de compra',
      error: error.message 
    });
  }
});

// GET /api/ordenes-compra/:id - Obtener orden específica
router.get('/:id', async (req, res) => {
  try {
    const orden = await OrdenCompra.obtenerPorId(req.params.id);
    
    if (!orden) {
      return res.status(404).json({ 
        success: false, 
        message: 'Orden de compra no encontrada' 
      });
    }

    // Obtener detalles de la orden
    const detalles = await DetalleOrden.obtenerPorOrden(req.params.id);
    
    res.json({ 
      success: true, 
      data: { ...orden, detalles } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener orden de compra',
      error: error.message 
    });
  }
});

// POST /api/ordenes-compra - Crear nueva orden
router.post('/', async (req, res) => {
  try {
    const { orden, detalles } = req.body;

    // Validaciones básicas
    if (!orden.id_proveedor || !orden.numero_orden || !orden.fecha_orden) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de orden incompletos' 
      });
    }

    // Crear la orden
    const idOrden = await OrdenCompra.crear(orden);

    // Agregar detalles si existen
    if (detalles && detalles.length > 0) {
      for (const detalle of detalles) {
        await DetalleOrden.agregarProducto({
          ...detalle,
          id_orden_compra: idOrden
        });
      }
    }

    // Obtener la orden completa creada
    const ordenCompleta = await OrdenCompra.obtenerPorId(idOrden);
    const ordenDetalles = await DetalleOrden.obtenerPorOrden(idOrden);

    res.status(201).json({ 
      success: true, 
      message: 'Orden de compra creada exitosamente',
      data: { ...ordenCompleta, detalles: ordenDetalles } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear orden de compra',
      error: error.message 
    });
  }
});

// PUT /api/ordenes-compra/:id - Actualizar orden
router.put('/:id', async (req, res) => {
  try {
    const ordenActualizada = await OrdenCompra.actualizar(
      req.params.id, 
      req.body
    );

    if (ordenActualizada === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Orden de compra no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Orden de compra actualizada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar orden de compra',
      error: error.message 
    });
  }
});

// DELETE /api/ordenes-compra/:id - Eliminar orden
router.delete('/:id', async (req, res) => {
  try {
    const eliminada = await OrdenCompra.eliminar(req.params.id);

    if (eliminada === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Orden de compra no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Orden de compra eliminada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar orden de compra',
      error: error.message 
    });
  }
});

// Rutas para detalles de orden
router.post('/:id/detalles', async (req, res) => {
  try {
    const detalleId = await DetalleOrden.agregarProducto({
      ...req.body,
      id_orden_compra: req.params.id
    });

    res.status(201).json({ 
      success: true, 
      message: 'Producto agregado a la orden',
      data: { id_detalle: detalleId } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al agregar producto a la orden',
      error: error.message 
    });
  }
});

router.put('/detalles/:idDetalle', async (req, res) => {
  try {
    const actualizado = await DetalleOrden.actualizar(
      req.params.idDetalle, 
      req.body
    );

    if (actualizado === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Detalle de orden no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Detalle de orden actualizado exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar detalle de orden',
      error: error.message 
    });
  }
});

router.delete('/detalles/:idDetalle', async (req, res) => {
  try {
    const eliminado = await DetalleOrden.eliminar(req.params.idDetalle);

    if (eliminado === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Detalle de orden no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Detalle de orden eliminado exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar detalle de orden',
      error: error.message 
    });
  }
});

module.exports = router;