// src/components/RegistroProducto.js
import React, { useState } from 'react';
import { db } from '../db/db';
import './RegistroProducto.css';

const RegistroProducto = ({ onBack }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    valor: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validar que todos los campos estén llenos
    if (!formData.codigo.trim() || !formData.descripcion.trim() || !formData.valor.trim()) {
      alert('Por favor, complete todos los campos');
      return;
    }

    // Validar que el valor sea un número válido
    const valorNumerico = parseFloat(formData.valor);
    if (isNaN(valorNumerico) || valorNumerico < 0) {
      alert('Por favor, ingrese un valor válido');
      return;
    }

    setIsLoading(true);

    try {
      // Guardar en la base de datos
      await db.productos.add({
        codigo: formData.codigo.trim(),
        descripcion: formData.descripcion.trim(),
        valor: valorNumerico,
        fecha_registro: new Date()
      });

      alert('Producto guardado exitosamente');
      
      // Limpiar el formulario
      setFormData({
        codigo: '',
        descripcion: '',
        valor: ''
      });

    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registro-producto">
      <div className="registro-producto-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Registro del producto</h1>
      </div>

      <div className="form-container">
        <div className="form-group">
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            placeholder="Código del producto"
            className="form-input"
          />
          <div className="qr-icon">📱</div>
        </div>

        <div className="form-group">
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción"
            className="form-textarea"
            rows="3"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            name="valor"
            value={formData.valor}
            onChange={handleInputChange}
            placeholder="Valor del producto"
            className="form-input"
            step="0.01"
            min="0"
          />
        </div>

        <button 
          className="save-button" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Ahorrar'}
        </button>
      </div>
    </div>
  );
};

export default RegistroProducto;