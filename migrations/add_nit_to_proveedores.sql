-- Migración: Agregar campo NIT a la tabla proveedores
-- Ejecutar manualmente en producción si la tabla ya existe

ALTER TABLE proveedores 
ADD COLUMN nit VARCHAR(20) NOT NULL DEFAULT '' AFTER nombre;

-- Opcional: Si quieres que sea único
-- ALTER TABLE proveedores ADD UNIQUE INDEX uk_nit (nit);
