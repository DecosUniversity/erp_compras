const express = require('express');
const router = express.Router();
const OrdenCompra = require('../models/ordenCompra');
const DetalleOrden = require('../models/detalleOrden');
// Posibles estados permitidos (API)
const ESTADOS_VALIDOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'ENTREGADA'];

// Mapeo a valores usados en la BD (p.ej., ENUM o convención existente)
// Mantener sincronizado con el esquema de la tabla ordenes_compra
const mapEstadoToDB = (estadoApi) => {
  switch (estadoApi) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'APROBADA':
      return 'Aprobada';
    case 'RECHAZADA':
      // ENUM real incluye 'Rechazada'
      return 'Rechazada';
    case 'ENTREGADA':
      // ENUM real incluye 'Completada'
      return 'Completada';
    default:
      return 'Pendiente';
  }
};

/**
 * @swagger
 * tags:
 *   - name: Órdenes de Compra
 *     description: Gestión de órdenes de compra
 *   - name: Detalles de Orden
 *     description: Gestión de detalles de órdenes de compra
 */

/**
 * @swagger
 * /api/ordenes-compra:
 *   get:
 *     summary: Obtener todas las órdenes de compra
 *     tags: [Órdenes de Compra]
 *     description: Recupera una lista de todas las órdenes de compra con información del proveedor
 *     responses:
 *       200:
 *         description: Lista de órdenes de compra obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrdenCompra'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   get:
 *     summary: Obtener una orden de compra específica
 *     tags: [Órdenes de Compra]
 *     description: Recupera una orden de compra específica por ID incluyendo sus detalles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la orden de compra
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Orden de compra obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OrdenCompraCompleta'
 *       404:
 *         description: Orden de compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/ordenes-compra:
 *   post:
 *     summary: Crear una nueva orden de compra
 *     tags: [Órdenes de Compra]
 *     description: Crea una nueva orden de compra con detalles opcionales
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orden
 *             properties:
 *               orden:
 *                 type: object
 *                 required:
 *                   - id_proveedor
 *                   - numero_orden
 *                   - fecha_orden
 *                 properties:
 *                   id_proveedor:
 *                     type: integer
 *                     example: 1
 *                   numero_orden:
 *                     type: string
 *                     example: "OC-2024-001"
 *                   fecha_orden:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   fecha_entrega_esperada:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-25"
 *                   estado:
 *                     type: string
 *                     enum: [Pendiente, Aprobada, Enviada, Recibida, Cancelada]
 *                     example: "Pendiente"
 *                   moneda:
 *                     type: string
 *                     example: "GTQ"
 *                   terminos_pago:
 *                     type: string
 *                     example: "30 días"
 *                   observaciones:
 *                     type: string
 *                     example: "Entrega urgente"
 *                   creado_por:
 *                     type: string
 *                     example: "usuario@empresa.com"
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_producto
 *                     - cantidad
 *                     - precio_unitario
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                       example: 101
 *                     cantidad:
 *                       type: number
 *                       example: 10
 *                     precio_unitario:
 *                       type: number
 *                       example: 25.50
 *                     descuento:
 *                       type: number
 *                       example: 5.0
 *                     descripcion_producto:
 *                       type: string
 *                       example: "Producto de alta calidad"
 *                     numero_linea:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Orden de compra creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden de compra creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/OrdenCompraCompleta'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/ordenes-compra/{id}/estado:
 *   put:
 *     summary: Actualizar el estado de una orden de compra
 *     tags: [Órdenes de Compra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, APROBADA, RECHAZADA, ENTREGADA]
 *                 example: APROBADA
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    let { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ success: false, message: 'El estado es requerido' });
    }

    estado = String(estado).toUpperCase();
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ success: false, message: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    try {
      // Verificar estado actual en BD para impedir cambios irreversibles
      const ordenActual = await OrdenCompra.obtenerPorId(id);
      if (!ordenActual) {
        return res.status(404).json({ success: false, message: 'Orden de compra no encontrada' });
      }
      const estadoActualDB = String(ordenActual.estado || '').trim();
      if (['Completada', 'Rechazada'].includes(estadoActualDB)) {
        return res.status(400).json({
          success: false,
          message: `No es posible cambiar el estado de una orden ${estadoActualDB.toUpperCase()}.`
        });
      }

      const estadoDB = mapEstadoToDB(estado);
      const affected = await OrdenCompra.actualizarEstado(id, estadoDB);
      if (!affected) {
        return res.status(404).json({ success: false, message: 'Orden de compra no encontrada' });
      }
      return res.json({ success: true, message: 'Estado actualizado exitosamente', data: { id, estado } });
    } catch (err) {
      console.error('[ERROR actualizarEstado]', err);
      return res.status(500).json({ success: false, message: 'Error al actualizar estado', error: err.message });
    }
  } catch (error) {
    console.error('[ERROR en endpoint /:id/estado]', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar estado', error: error.message });
  }
});

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   put:
 *     summary: Actualizar una orden de compra
 *     tags: [Órdenes de Compra]
 *     description: Actualiza los datos de una orden de compra existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la orden de compra
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, Aprobada, Enviada, Recibida, Cancelada]
 *                 example: "Aprobada"
 *               fecha_entrega_esperada:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-30"
 *               observaciones:
 *                 type: string
 *                 example: "Cambio en fecha de entrega"
 *     responses:
 *       200:
 *         description: Orden de compra actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Orden de compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   delete:
 *     summary: Eliminar una orden de compra
 *     tags: [Órdenes de Compra]
 *     description: Elimina una orden de compra y todos sus detalles asociados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la orden de compra
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Orden de compra eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Orden de compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/ordenes-compra/{id}/detalles:
 *   post:
 *     summary: Agregar producto a una orden de compra
 *     tags: [Detalles de Orden]
 *     description: Agrega un nuevo producto (detalle) a una orden de compra existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la orden de compra
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - cantidad
 *               - precio_unitario
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 101
 *               cantidad:
 *                 type: number
 *                 example: 5
 *               precio_unitario:
 *                 type: number
 *                 example: 15.75
 *               descuento:
 *                 type: number
 *                 example: 2.0
 *               descripcion_producto:
 *                 type: string
 *                 example: "Producto adicional"
 *               numero_linea:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Producto agregado exitosamente a la orden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Producto agregado a la orden"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_detalle:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/ordenes-compra/detalles/{idDetalle}:
 *   put:
 *     summary: Actualizar un detalle de orden
 *     tags: [Detalles de Orden]
 *     description: Actualiza la información de un detalle específico de una orden de compra
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         required: true
 *         description: ID único del detalle de orden
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: number
 *                 example: 8
 *               precio_unitario:
 *                 type: number
 *                 example: 20.00
 *               descuento:
 *                 type: number
 *                 example: 3.0
 *     responses:
 *       200:
 *         description: Detalle de orden actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Detalle de orden no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/ordenes-compra/detalles/{idDetalle}:
 *   delete:
 *     summary: Eliminar un detalle de orden
 *     tags: [Detalles de Orden]
 *     description: Elimina un detalle específico de una orden de compra
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         required: true
 *         description: ID único del detalle de orden
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detalle de orden eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Detalle de orden no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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