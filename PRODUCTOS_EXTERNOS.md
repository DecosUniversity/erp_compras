# Manejo de Productos Externos en Órdenes de Compra

## Descripción
Este sistema de ERP Compras está diseñado para trabajar con productos que existen en una API externa. No mantiene su propia tabla de productos, sino que almacena únicamente el `id_producto` como referencia.

## Estructura de Detalles de Orden

### Campos en la Base de Datos
```sql
detalles_orden_compra:
- id_detalle (PK)
- id_orden_compra (FK a ordenes_compra)
- id_producto (referencia externa - INT)
- cantidad
- precio_unitario
- descuento
- subtotal_linea (calculado automáticamente)
- impuestos_linea (calculado automáticamente)
- total_linea (calculado automáticamente)
- descripcion_producto (opcional)
- numero_linea
```

### Campos NO Incluidos
- ❌ `nombre_producto` - Se obtiene de la API externa
- ❌ `codigo_producto` - Se obtiene de la API externa
- ❌ `categoria_producto` - Se obtiene de la API externa
- ❌ Foreign Key a tabla productos - No existe

## Flujo de Trabajo Recomendado

### 1. Al Crear una Orden de Compra
```javascript
// Ejemplo de request
POST /api/ordenes-compra
{
  "orden": {
    "id_proveedor": 1,
    "numero_orden": "OC-2024-001",
    "fecha_orden": "2024-10-08",
    // ... otros campos
  },
  "detalles": [
    {
      "id_producto": 101,  // ID del producto en la API externa
      "cantidad": 5,
      "precio_unitario": 25.50,
      "descuento": 2.0,
      "descripcion_producto": "Producto XYZ (opcional)",
      "numero_linea": 1
    }
  ]
}
```

### 2. Al Mostrar Órdenes de Compra
```javascript
// Response del sistema ERP
{
  "success": true,
  "data": {
    "id_orden_compra": 1,
    "numero_orden": "OC-2024-001",
    // ... campos de la orden
    "detalles": [
      {
        "id_detalle": 1,
        "id_producto": 101,  // Usar este ID para consultar la API externa
        "cantidad": 5,
        "precio_unitario": 25.50,
        "descuento": 2.0,
        "subtotal_linea": 122.50,
        "total_linea": 122.50,
        "descripcion_producto": "Producto XYZ"
      }
    ]
  }
}

// Tu aplicación frontend debe hacer:
// GET /api/productos/101 (en la API externa)
// Para obtener: nombre, código, categoría, etc.
```

### 3. Integración Frontend Recomendada
```javascript
// Pseudocódigo para mostrar orden completa
async function mostrarOrdenCompleta(idOrden) {
  // 1. Obtener orden del ERP
  const orden = await fetch(`/api/ordenes-compra/${idOrden}`);
  
  // 2. Para cada detalle, obtener info del producto
  for (const detalle of orden.detalles) {
    const producto = await fetch(`/api-productos/productos/${detalle.id_producto}`);
    detalle.nombre_producto = producto.nombre;
    detalle.codigo_producto = producto.codigo;
    detalle.categoria = producto.categoria;
  }
  
  // 3. Mostrar orden completa
  return orden;
}
```

## Ventajas de Esta Arquitectura

### ✅ Separación de Responsabilidades
- **ERP Compras**: Maneja órdenes, proveedores, flujo de compras
- **API Productos**: Maneja catálogo, inventario, especificaciones

### ✅ Consistencia de Datos
- Los datos del producto siempre están actualizados (single source of truth)
- No hay duplicación de información
- Cambios en productos se reflejan automáticamente

### ✅ Escalabilidad
- Cada servicio puede escalar independientemente
- Facilita microservicios
- Reduce tamaño de base de datos del ERP

### ✅ Flexibilidad
- Puedes cambiar la API de productos sin afectar el ERP
- Diferentes sistemas pueden usar la misma API de productos
- Fácil integración con sistemas externos

## Consideraciones Importantes

### 🔍 Validación de Productos
```javascript
// Antes de crear una orden, validar que el producto existe
async function validarProducto(idProducto) {
  try {
    const response = await fetch(`/api-productos/productos/${idProducto}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
```

### 📱 Manejo de Errores
- ¿Qué pasa si la API de productos no responde?
- ¿Cómo manejar productos que ya no existen?
- Cache local para información básica de productos frecuentes

### 🔄 Sincronización
- Considera webhooks o eventos para actualizar precios
- Procesos batch para validar integridad de referencias
- Logs de productos no encontrados

## Ejemplos de Uso

### Crear Orden Simple
```bash
curl -X POST https://erpcompras-production.up.railway.app/api/ordenes-compra \
  -H "Content-Type: application/json" \
  -d '{
    "orden": {
      "id_proveedor": 1,
      "numero_orden": "OC-2024-TEST",
      "fecha_orden": "2024-10-08",
      "estado": "Pendiente",
      "moneda": "GTQ",
      "terminos_pago": "30 días",
      "creado_por": "usuario@empresa.com"
    },
    "detalles": [
      {
        "id_producto": 101,
        "cantidad": 10,
        "precio_unitario": 25.50,
        "descuento": 5.0,
        "descripcion_producto": "Producto desde API externa",
        "numero_linea": 1
      }
    ]
  }'
```

### Obtener Orden Completa
```bash
curl https://erpcompras-production.up.railway.app/api/ordenes-compra/1
```

Esta arquitectura te permite mantener un sistema limpio y escalable donde cada componente tiene su responsabilidad específica.