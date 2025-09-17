// src/db/db.js
import Dexie from 'dexie';

export const db = new Dexie('InventarioDB');

db.version(1).stores({
  productos: '++id, codigo, descripcion, valor, stock, fecha_registro',
  servicios: '++id, descripcion, valor, fecha_registro',
  clientes: '++id, nombre, direccion, telefono, fecha_registro',
  recibos: '++id, numero, cliente_id, tipo, items, total, descuento, es_a_domicilio, direccion_entrega, fecha',
  gastos: '++id, tipo, descripcion, valor, fecha, categoria',
  movimientos_stock: '++id, producto_id, tipo, cantidad, descripcion, fecha'
});

// Función para inicializar datos de ejemplo (opcional)
export const inicializarDatos = async () => {
  const countProductos = await db.productos.count();
  
  if (countProductos === 0) {
    // Agregar algunos productos de ejemplo
    await db.productos.bulkAdd([
      {
        codigo: 'PROD001',
        descripcion: 'Producto de ejemplo',
        valor: 100.00,
        fecha_registro: new Date()
      }
    ]);
    
    console.log('Datos de ejemplo agregados');
  }
};