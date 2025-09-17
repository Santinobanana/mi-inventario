// src/components/ServiciosLista.js
import React, { useState, useEffect } from 'react';
import { productosAPI, clientesAPI, serviciosAPI, recibosAPI } from '../db/firebaseOperations.js';
import './ServiciosLista.css';

const ServiciosLista = ({ onBack }) => {
  const [servicios, setServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setIsLoading(true);
      const serviciosData = await productosAPI.servicios.orderBy('fecha_registro').reverse().toArray();
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      alert('Error al cargar los servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarServicio = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este servicio?')) {
      try {
        await productosAPI.servicios.delete(id);
        await cargarServicios(); // Recargar la lista
        alert('Servicio eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar servicio:', error);
        alert('Error al eliminar el servicio');
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
      <div className="servicios-lista">
        <div className="servicios-lista-header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1>Servicios de lista</h1>
        </div>
        <div className="loading">Cargando servicios...</div>
      </div>
    );
  }

  return (
    <div className="servicios-lista">
      <div className="servicios-lista-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Servicios de lista</h1>
      </div>

      <div className="servicios-container">
        {servicios.length === 0 ? (
          <div className="empty-state">
            <p>No hay servicios registrados</p>
            <span>Agregue servicios desde la sección de Registros</span>
          </div>
        ) : (
          servicios.map((servicio) => (
            <div key={servicio.id} className="servicio-card">
              <div className="servicio-header">
                <div className="servicio-badge">Servicio</div>
                <button 
                  className="delete-button"
                  onClick={() => eliminarServicio(servicio.id)}
                >
                  🗑️
                </button>
              </div>
              
              <div className="servicio-descripcion">
                {servicio.descripcion}
              </div>
              
              <div className="servicio-footer">
                <div className="servicio-valor">{formatearValor(servicio.valor)}</div>
                <div className="servicio-fecha">
                  {formatearFecha(servicio.fecha_registro)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiciosLista;