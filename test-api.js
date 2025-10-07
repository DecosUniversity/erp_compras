const http = require('http');

async function testAPI() {
  console.log('🧪 Iniciando tests de la API...');
  
  const baseURL = 'http://localhost:3000';
  
  // Test 1: Health check
  try {
    const response = await fetch(`${baseURL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data.status);
  } catch (error) {
    console.log('❌ Health check falló:', error.message);
  }
  
  // Test 2: Swagger docs
  try {
    const response = await fetch(`${baseURL}/api-docs`);
    if (response.status === 200) {
      console.log('✅ Swagger docs: Disponible');
    } else {
      console.log('❌ Swagger docs: No disponible');
    }
  } catch (error) {
    console.log('❌ Swagger docs falló:', error.message);
  }
  
  // Test 3: API endpoints
  try {
    const response = await fetch(`${baseURL}/api/proveedores`);
    const data = await response.json();
    console.log('✅ API proveedores:', data.success ? 'Funcionando' : 'Error');
  } catch (error) {
    console.log('❌ API proveedores falló:', error.message);
  }
  
  try {
    const response = await fetch(`${baseURL}/api/ordenes-compra`);
    const data = await response.json();
    console.log('✅ API órdenes de compra:', data.success ? 'Funcionando' : 'Error');
  } catch (error) {
    console.log('❌ API órdenes de compra falló:', error.message);
  }
}

// Esperar un poco para que el servidor inicie
setTimeout(testAPI, 3000);