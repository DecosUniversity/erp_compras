const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

/**
 * @swagger
 * tags:
 *   name: CRM
 *   description: Integración con CRM externo
 */

/**
 * @swagger
 * /api/crm/prospectos:
 *   get:
 *     summary: Listar contactos prospectos desde CRM
 *     tags: [CRM]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Tamaño de página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre/email
 *     responses:
 *       200:
 *         description: Lista de prospectos
 */
router.get('/prospectos', crmController.getProspectos);

module.exports = router;
