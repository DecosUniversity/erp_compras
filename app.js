const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Proveedores',
      version: '1.0.0',
      description: 'Documentación de la API para el manejo de proveedores',
      contact: {
        name: 'Tu Nombre',
        email: 'tu@email.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor local'
      }
    ],
    components: {
      schemas: {
        Proveedor: {
          type: 'object',
          properties: {
            id_proveedor: {
              type: 'integer',
              example: 1
            },
            nombre: {
              type: 'string',
              example: 'Proveedor Ejemplo S.A.'
            },
            contacto: {
              type: 'string',
              example: 'Juan Pérez'
            },
            telefono: {
              type: 'string',
              example: '555-123456'
            },
            email: {
              type: 'string',
              example: 'contacto@proveedor.com'
            },
            direccion: {
              type: 'string',
              example: 'Calle Falsa 123'
            },
            ciudad: {
              type: 'string',
              example: 'Ciudad de México'
            },
            pais: {
              type: 'string',
              example: 'México'
            },
            estado: {
              type: 'string',
              enum: ['Activo', 'Inactivo'],
              example: 'Activo'
            },
            fecha_registro: {
              type: 'string',
              format: 'date',
              example: '2023-01-01'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Ruta a tus archivos de rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/proveedores', proveedoresRoutes);

// Ruta para la documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de proveedores corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});