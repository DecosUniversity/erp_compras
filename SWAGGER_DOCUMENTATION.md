# Documentación API - Órdenes de Compra

Este documento describe los endpoints de la API para la gestión de órdenes de compra y sus detalles, incluyendo la documentación Swagger integrada.

## Acceso a la Documentación Swagger

La documentación interactiva de Swagger está disponible en:
- **Local**: http://localhost:3000/api-docs
- **Producción**: https://erpcompras-production.up.railway.app/api-docs

## Endpoints Documentados

### Órdenes de Compra

#### 1. GET /api/ordenes-compra
- **Descripción**: Obtener todas las órdenes de compra
- **Tags**: Órdenes de Compra
- **Respuestas**:
  - 200: Lista de órdenes de compra exitosa
  - 500: Error del servidor

#### 2. GET /api/ordenes-compra/{id}
- **Descripción**: Obtener una orden de compra específica con sus detalles
- **Tags**: Órdenes de Compra
- **Parámetros**: 
  - `id` (path, integer, requerido): ID único de la orden de compra
- **Respuestas**:
  - 200: Orden de compra obtenida exitosamente
  - 404: Orden de compra no encontrada
  - 500: Error del servidor

#### 3. POST /api/ordenes-compra
- **Descripción**: Crear una nueva orden de compra con detalles opcionales
- **Tags**: Órdenes de Compra
- **Body requerido**:
  ```json
  {
    "orden": {
      "id_proveedor": 1,
      "numero_orden": "OC-2024-001",
      "fecha_orden": "2024-01-15",
      "fecha_entrega_esperada": "2024-01-25",
      "estado": "PENDIENTE",
      "moneda": "GTQ",
      "terminos_pago": "30 días",
      "observaciones": "Entrega urgente",
      "creado_por": "usuario@empresa.com"
    },
    "detalles": [
      {
        "id_producto": 101,
        "cantidad": 10,
        "precio_unitario": 25.50,
        "descuento": 5.0,
        "descripcion_producto": "Producto de alta calidad",
        "numero_linea": 1
      }
    ]
  }
  ```
- **Respuestas**:
  - 201: Orden de compra creada exitosamente
  - 400: Datos de entrada inválidos
  - 500: Error del servidor

#### 4. PUT /api/ordenes-compra/{id}
- **Descripción**: Actualizar una orden de compra existente
- **Tags**: Órdenes de Compra
- **Parámetros**: 
  - `id` (path, integer, requerido): ID único de la orden de compra
- **Body**:
  ```json
  {
    "estado": "APROBADA",
    "fecha_entrega_esperada": "2024-01-30",
    "observaciones": "Cambio en fecha de entrega"
  }
  ```
- **Respuestas**:
  - 200: Orden de compra actualizada exitosamente
  - 404: Orden de compra no encontrada
  - 500: Error del servidor

#### 5.1. PUT /api/ordenes-compra/{id}/estado
- **Descripción**: Actualizar únicamente el estado de una orden de compra
- **Tags**: Órdenes de Compra
- **Parámetros**: 
  - `id` (path, integer, requerido): ID único de la orden de compra
- **Body requerido**:
  ```json
  {
    "estado": "APROBADA"
  }
  ```
- **Estados permitidos**: `PENDIENTE`, `APROBADA`, `RECHAZADA`, `ENTREGADA`
- **Respuestas**:
  - 200: Estado actualizado exitosamente
  - 400: Estado inválido o faltante
  - 404: Orden de compra no encontrada
  - 500: Error del servidor

#### 6. DELETE /api/ordenes-compra/{id}
- **Descripción**: Eliminar una orden de compra y todos sus detalles asociados
- **Tags**: Órdenes de Compra
- **Parámetros**: 
  - `id` (path, integer, requerido): ID único de la orden de compra
- **Respuestas**:
  - 200: Orden de compra eliminada exitosamente
  - 404: Orden de compra no encontrada
  - 500: Error del servidor

### Detalles de Orden

#### 6. POST /api/ordenes-compra/{id}/detalles
- **Descripción**: Agregar un nuevo producto a una orden de compra existente
- **Tags**: Detalles de Orden
- **Parámetros**: 
  - `id` (path, integer, requerido): ID único de la orden de compra
- **Body requerido**:
  ```json
  {
    "id_producto": 101,
    "cantidad": 5,
    "precio_unitario": 15.75,
    "descuento": 2.0,
    "descripcion_producto": "Producto adicional",
    "numero_linea": 2
  }
  ```
- **Respuestas**:
  - 201: Producto agregado exitosamente a la orden
  - 500: Error del servidor

#### 7. PUT /api/ordenes-compra/detalles/{idDetalle}
- **Descripción**: Actualizar un detalle específico de una orden de compra
- **Tags**: Detalles de Orden
- **Parámetros**: 
  - `idDetalle` (path, integer, requerido): ID único del detalle de orden
- **Body**:
  ```json
  {
    "cantidad": 8,
    "precio_unitario": 20.00,
    "descuento": 3.0
  }
  ```
- **Respuestas**:
  - 200: Detalle de orden actualizado exitosamente
  - 404: Detalle de orden no encontrado
  - 500: Error del servidor

#### 8. DELETE /api/ordenes-compra/detalles/{idDetalle}
- **Descripción**: Eliminar un detalle específico de una orden de compra
- **Tags**: Detalles de Orden
- **Parámetros**: 
  - `idDetalle` (path, integer, requerido): ID único del detalle de orden
- **Respuestas**:
  - 200: Detalle de orden eliminado exitosamente
  - 404: Detalle de orden no encontrado
  - 500: Error del servidor

## Esquemas de Datos

### OrdenCompra
```json
{
  "id_orden_compra": 1,
  "id_proveedor": 1,
  "numero_orden": "OC-2024-001",
  "fecha_orden": "2024-01-15",
  "fecha_entrega_esperada": "2024-01-25",
  "estado": "PENDIENTE",
  "moneda": "GTQ",
  "terminos_pago": "30 días",
  "observaciones": "Entrega urgente requerida",
  "creado_por": "usuario@empresa.com",
  "fecha_creacion": "2024-01-15T10:30:00Z",
  "nombre_proveedor": "Proveedor Ejemplo S.A.",
  "contacto_proveedor": "Juan Pérez"
}
```

### DetalleOrden
```json
{
  "id_detalle": 1,
  "id_orden_compra": 1,
  "id_producto": 101,
  "cantidad": 10,
  "precio_unitario": 25.50,
  "descuento": 5.0,
  "descripcion_producto": "Producto de alta calidad",
  "numero_linea": 1,
  "nombre_producto": "Producto ABC",
  "codigo_producto": "PROD-001"
}
```

### Estados Válidos para Órdenes
- `PENDIENTE`
- `APROBADA`
- `RECHAZADA`
- `ENTREGADA`

## Respuestas de la API

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación realizada exitosamente",
  "data": { /* datos específicos del endpoint */ }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Error en la operación",
  "error": "Detalles del error"
}
```

## Notas Importantes

1. **Autenticación**: Actualmente no se requiere autenticación para estos endpoints
2. **CORS**: La API está configurada para aceptar requests desde los dominios permitidos
3. **Validación**: Los datos requeridos están marcados en la documentación Swagger
4. **Formatos**: Las fechas deben estar en formato ISO (YYYY-MM-DD)
5. **Números**: Los precios y cantidades pueden ser decimales

## Testing con Swagger UI

1. Accede a la documentación: http://localhost:3000/api-docs
2. Selecciona el endpoint que deseas probar
3. Haz clic en "Try it out"
4. Ingresa los parámetros requeridos
5. Haz clic en "Execute"
6. Revisa la respuesta en la sección "Response"

## Ejemplo de Uso Completo

### Crear una orden de compra completa:
```json
POST /api/ordenes-compra
{
  "orden": {
    "id_proveedor": 1,
    "numero_orden": "OC-2024-001",
    "fecha_orden": "2024-01-15",
    "fecha_entrega_esperada": "2024-01-25",
    "estado": "PENDIENTE",
    "moneda": "GTQ",
    "terminos_pago": "30 días",
    "observaciones": "Entrega urgente",
    "creado_por": "admin@empresa.com"
  },
  "detalles": [
    {
      "id_producto": 101,
      "cantidad": 10,
      "precio_unitario": 25.50,
      "descuento": 5.0,
      "descripcion_producto": "Producto principal",
      "numero_linea": 1
    },
    {
      "id_producto": 102,
      "cantidad": 5,
      "precio_unitario": 15.75,
      "descuento": 2.0,
      "descripcion_producto": "Producto secundario",
      "numero_linea": 2
    }
  ]
}
```

Esta documentación se actualiza automáticamente con cada cambio en los endpoints de la API.