// src/components/RegistroProducto.js
import React, { useState } from 'react';
import { productosAPI } from '../db/firebaseOperations';
import './RegistroProducto.css';

function RegistroProducto({ onVolver }) {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    valor: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.codigo.trim() || !formData.descripcion.trim() || !formData.valor) {
      setMensaje('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(formData.valor) <= 0) {
      setMensaje('El valor debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setMensaje('');

    try {
      // Guardar en Firebase
      await productosAPI.agregar({
        codigo: formData.codigo.trim(),
        descripcion: formData.descripcion.trim(),
        valor: parseFloat(formData.valor),
        stock: 0 // Inicializar stock en 0
      });

      setMensaje('✅ Producto guardado exitosamente');
      
      // Limpiar formulario
      setFormData({
        codigo: '',
        descripcion: '',
        valor: ''
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMensaje('');
      }, 3000);

    } catch (error) {
      console.error('Error guardando producto:', error);
      setMensaje('❌ Error al guardar el producto. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-producto">
      <div className="header">
        <button className="btn-volver" onClick={onVolver}>
          ← Volver
        </button>
        <h2>Registro de Producto</h2>
      </div>

      <form onSubmit={handleSubmit} className="formulario">
        <div className="campo">
          <label htmlFor="codigo">
            <span className="icono">📱</span>
            Código
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            placeholder="Ingresa el código del producto"
            disabled={loading}
          />
        </div>

        <div className="campo">
          <label htmlFor="descripcion">
            <span className="icono">📝</span>
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe el producto"
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="campo">
          <label htmlFor="valor">
            <span className="icono">💰</span>
            Valor
          </label>
          <input
            type="number"
            id="valor"
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>

        {mensaje && (
          <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
            {mensaje}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-guardar"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Guardando...
            </>
          ) : (
            'Guardar Producto'
          )}
        </button>
      </form>

      {/* Indicador de conexión */}
      <div className="estado-conexion">
        <span className={`indicador ${navigator.onLine ? 'online' : 'offline'}`}>
          {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
        </span>
        <small>
          {navigator.onLine 
            ? 'Los datos se sincronizan automáticamente' 
            : 'Los datos se guardarán cuando vuelva la conexión'
          }
        </small>
      </div>
    </div>
  );
}

export default RegistroProducto;