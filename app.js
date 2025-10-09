const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const DatabaseInitializer = require('./config/initDB');

const proveedoresRoutes = require('./routes/proveedoresRoutes');
const ordenesRoutes = require('./routes/ordenesCompra');

const app = express();

// Puerto
const PORT = process.env.PORT || 3000;



// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de ERP Compras',
      version: '1.0.0',
      description: 'Documentación de la API para el manejo de proveedores, órdenes de compra y detalles de orden',
      contact: {
        name: 'Dennis Cornel',
        email: 'dcornels@miumg.edu.gt'
      }
    },
    servers: [
      {
        url: 'https://erpcompras-production.up.railway.app', // ✅ URL correcta
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000', // ✅ Para desarrollo
        description: 'Local server',
      },
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
        },
        OrdenCompra: {
          type: 'object',
          properties: {
            id_orden_compra: {
              type: 'integer',
              example: 1
            },
            id_proveedor: {
              type: 'integer',
              example: 1
            },
            numero_orden: {
              type: 'string',
              example: 'OC-2024-001'
            },
            fecha_orden: {
              type: 'string',
              format: 'date',
              example: '2024-01-15'
            },
            fecha_entrega_esperada: {
              type: 'string',
              format: 'date',
              example: '2024-01-25'
            },
            estado: {
              type: 'string',
              enum: ['Pendiente', 'Aprobada', 'Enviada', 'Recibida', 'Cancelada'],
              example: 'Pendiente'
            },
            moneda: {
              type: 'string',
              example: 'GTQ'
            },
            terminos_pago: {
              type: 'string',
              example: '30 días'
            },
            observaciones: {
              type: 'string',
              example: 'Entrega urgente requerida'
            },
            creado_por: {
              type: 'string',
              example: 'usuario@empresa.com'
            },
            fecha_creacion: {
              type: 'string',
              format: 'datetime',
              example: '2024-01-15T10:30:00Z'
            },
            nombre_proveedor: {
              type: 'string',
              example: 'Proveedor Ejemplo S.A.'
            },
            contacto_proveedor: {
              type: 'string',
              example: 'Juan Pérez'
            }
          }
        },
        DetalleOrden: {
          type: 'object',
          properties: {
            id_detalle: {
              type: 'integer',
              example: 1
            },
            id_orden_compra: {
              type: 'integer',
              example: 1
            },
            id_producto: {
              type: 'integer',
              example: 101,
              description: 'ID del producto (referencia externa)'
            },
            cantidad: {
              type: 'number',
              example: 10
            },
            precio_unitario: {
              type: 'number',
              format: 'decimal',
              example: 25.50
            },
            descuento: {
              type: 'number',
              format: 'decimal',
              example: 5.0
            },
            subtotal_linea: {
              type: 'number',
              format: 'decimal',
              example: 240.50,
              description: 'Calculado automáticamente'
            },
            impuestos_linea: {
              type: 'number',
              format: 'decimal',
              example: 28.86,
              description: 'Calculado automáticamente'
            },
            total_linea: {
              type: 'number',
              format: 'decimal',
              example: 269.36,
              description: 'Calculado automáticamente'
            },
            descripcion_producto: {
              type: 'string',
              example: 'Producto de alta calidad'
            },
            numero_linea: {
              type: 'integer',
              example: 1
            }
          }
        },
        OrdenCompraCompleta: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/OrdenCompra' },
            {
              type: 'object',
              properties: {
                detalles: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/DetalleOrden' }
                }
              }
            }
          ]
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operación realizada exitosamente'
            },
            data: {
              type: 'object'
            },
            error: {
              type: 'string'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error en la operación'
            },
            error: {
              type: 'string',
              example: 'Detalles del error'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './app.js'], // ✅ Ajusta según tu estructura
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // Desarrollo local backend
    'http://localhost:5173', // Desarrollo local frontend
    'http://localhost:5174', // Desarrollo local frontend (puerto alternativo)
    'https://erpcompras-production.up.railway.app' // Tu propio backend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(bodyParser.json());

// ✅ Manejo explícito de preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

// Inicializar base de datos al iniciar (opcional)
//const initDatabase = require('./scripts/initDB');
//initDatabase();

// Rutas
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/ordenes-compra', ordenesRoutes);

// Ruta para la documentación Swagger
app.use('/api-docs', cors(), swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.execute('SELECT 1');
    res.status(200).json({ 
      status: 'OK', 
      database: 'connected',
      cors: 'configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Función para iniciar el servidor con inicialización de BD
async function startServer() {
  try {
    // Iniciar servidor primero
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor de proveedores corriendo en http://0.0.0.0:${PORT}`);
      console.log(`Documentación Swagger disponible en http://0.0.0.0:${PORT}/api-docs`);
    });

    // Luego inicializar base de datos de forma asíncrona
    DatabaseInitializer.initialize();
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();