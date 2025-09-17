// src/components/GenerarRecibo.js
import React from 'react';
import './GenerarRecibo.css';

const GenerarRecibo = ({ onNavigate, onBack }) => {
  const reciboItems = [
    {
      id: 'recibo-producto',
      title: 'Recibo del producto',
      subtitle: 'Crear recibo de producto',
      icon: '📄'
    },
    {
      id: 'recibo-servicio',
      title: 'Recibo de Servicio',
      subtitle: 'Crear recibo de servicio',
      icon: '📄'
    }
  ];

  return (
    <div className="generar-recibo">
      <div className="recibo-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Recibo</h1>
      </div>
      
      <div className="recibo-subtitle">
        <p>Crear recibos de productos o servicios.</p>
      </div>

      <div className="recibo-items">
        {reciboItems.map((item) => (
          <div 
            key={item.id}
            className="recibo-item"
            onClick={() => onNavigate(item.id)}
          >
            <div className="recibo-icon">{item.icon}</div>
            <div className="recibo-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
            <div className="recibo-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerarRecibo;