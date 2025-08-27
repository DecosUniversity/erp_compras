const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: Operaciones relacionadas con proveedores
 */

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Obtener todos los proveedores
 *     tags: [Proveedores]
 *     responses:
 *       200:
 *         description: Lista de todos los proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 */
router.get('/', proveedoresController.getAllProveedores);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener un proveedor por ID
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor
 *     responses:
 *       200:
 *         description: Detalles del proveedor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/:id', proveedoresController.getProveedorById);

/**
 * @swagger
 * /api/proveedores:
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Proveedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       201:
 *         description: Proveedor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', proveedoresController.createProveedor);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   put:
 *     summary: Actualizar un proveedor
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       200:
 *         description: Proveedor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */
router.put('/:id', proveedoresController.updateProveedor);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   delete:
 *     summary: Inactivar un proveedor (eliminación lógica)
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor a inactivar
 *     responses:
 *       204:
 *         description: Proveedor inactivado exitosamente
 *       404:
 *         description: Proveedor no encontrado
 */
router.delete('/:id', proveedoresController.deleteProveedor);

/**
 * @swagger
 * /api/proveedores/{id}/hard:
 *   delete:
 *     summary: Eliminar físicamente un proveedor (eliminación permanente)
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proveedor a eliminar
 *     responses:
 *       204:
 *         description: Proveedor eliminado exitosamente
 *       404:
 *         description: Proveedor no encontrado
 */
router.delete('/:id/hard', proveedoresController.hardDeleteProveedor);

module.exports = router;