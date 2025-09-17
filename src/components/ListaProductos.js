// src/components/ListaProductos.js
import React, { useState, useEffect } from 'react';
import { productosAPI } from '../db/firebaseOperations';
import './ListaProductos.css';

const ListaProductos = ({ onBack }) => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setIsLoading(true);
      const productosData = await productosAPI.obtenerTodos();
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await productosAPI.eliminar(id);
        await cargarProductos(); // Recargar la lista
        alert('Producto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  if (isLoading) {
    return (
      <div className="lista-productos">
        <div className="lista-productos-header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1>Lista de Productos</h1>
        </div>
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="lista-productos">
      <div className="lista-productos-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Lista de Productos</h1>
      </div>

      <div className="productos-container">
        {productos.length === 0 ? (
          <div className="empty-state">
            <p>No hay productos registrados</p>
            <span>Agregue productos desde la sección de Registros</span>
          </div>
        ) : (
          productos.map((producto) => (
            <div key={producto.id} className="producto-card">
              <div className="producto-header">
                <div className="producto-codigo">{producto.codigo}</div>
                <button 
                  className="delete-button"
                  onClick={() => eliminarProducto(producto.id)}
                >
                  🗑️
                </button>
              </div>
              
              <div className="producto-descripcion">
                {producto.descripcion}
              </div>
              
              <div className="producto-footer">
                <div className="producto-valor">{formatearValor(producto.valor)}</div>
                <div className="producto-fecha">
                  {formatearFecha(producto.fecha_registro)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListaProductos;