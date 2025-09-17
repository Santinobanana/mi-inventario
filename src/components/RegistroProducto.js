import React, { useState } from 'react';
import { productosAPI } from '../db/firebaseOperations';
import './RegistroProducto.css';

function RegistroProducto({ onBack }) {
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
      await productosAPI.agregar({
        codigo: formData.codigo.trim(),
        descripcion: formData.descripcion.trim(),
        valor: parseFloat(formData.valor),
        stock: 0 // Inicializar stock en 0
      });

      setMensaje('✅ Producto guardado exitosamente');
      
      setFormData({
        codigo: '',
        descripcion: '',
        valor: ''
      });

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
      <div className="registro-producto-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Registro de Producto</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="📱 Código"
              className="form-input"
              disabled={loading}
            />
            <div className="qr-icon">📱</div>
          </div>

          <div className="form-group">
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="📝 Descripción"
              className="form-textarea"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              placeholder="💰 Valor"
              className="form-input"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          {mensaje && (
            <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`} 
                 style={{
                   padding: '12px',
                   borderRadius: '8px',
                   marginBottom: '15px',
                   textAlign: 'center',
                   backgroundColor: mensaje.includes('✅') ? '#e8f5e8' : '#ffebee',
                   color: mensaje.includes('✅') ? '#2e7d32' : '#d32f2f',
                   fontSize: '14px'
                 }}>
              {mensaje}
            </div>
          )}

          <button 
            type="submit" 
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: navigator.onLine ? '#4caf50' : '#f44336',
            marginRight: '8px'
          }}></span>
          {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
          <br />
          <small style={{ fontSize: '12px', color: '#999' }}>
            {navigator.onLine 
              ? 'Los datos se sincronizan automáticamente' 
              : 'Los datos se guardarán cuando vuelva la conexión'
            }
          </small>
        </div>
      </div>
    </div>
  );
}

export default RegistroProducto;