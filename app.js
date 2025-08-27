const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.DB_PORT || 3000;



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
app.use(cors({
  origin: [
    'http://localhost:3000', // Desarrollo local
    'https://erpcompras-production.up.railway.app' // Tu propio backend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());

// ✅ Manejar preflight requests
app.options('*', cors()); // Habilitar preflight para todas las rutas


// Inicializar base de datos al iniciar (opcional)
//const initDatabase = require('./scripts/initDB');
//initDatabase();

// Rutas
app.use('/api/proveedores', proveedoresRoutes);

// Ruta para la documentación Swagger
app.use('/api-docs', cors(), swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    cors: 'configured',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de proveedores corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Documentación Swagger disponible en http://0.0.0.0:${PORT}/api-docs`);
});