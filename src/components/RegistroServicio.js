// src/components/RegistroServicio.js
import React, { useState } from 'react';
import { db } from '../db/db';
import './RegistroServicio.css';

const RegistroServicio = ({ onBack }) => {
  const [formData, setFormData] = useState({
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
    if (!formData.descripcion.trim() || !formData.valor.trim()) {
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
      await db.servicios.add({
        descripcion: formData.descripcion.trim(),
        valor: valorNumerico,
        fecha_registro: new Date()
      });

      alert('Servicio guardado exitosamente');
      
      // Limpiar el formulario
      setFormData({
        descripcion: '',
        valor: ''
      });

    } catch (error) {
      console.error('Error al guardar servicio:', error);
      alert('Error al guardar el servicio. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registro-servicio">
      <div className="registro-servicio-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Registro de servicio</h1>
      </div>

      <div className="form-container">
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

export default RegistroServicio;