// src/components/Registros.js
import React from 'react';
import './Registros.css';

const Registros = ({ onNavigate, onBack }) => {
  const registroItems = [
    {
      id: 'registro-producto',
      title: 'Registración del producto',
      subtitle: 'Registrar producto',
      icon: '📝'
    },
    {
      id: 'registro-servicio',
      title: 'Registro de servicio',
      subtitle: 'Servicio de registro',
      icon: '📝'
    }
  ];

  return (
    <div className="registros">
      <div className="registros-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Registros</h1>
      </div>
      
      <div className="registros-subtitle">
        <p>Registros de productos y servicios.</p>
      </div>

      <div className="registro-items">
        {registroItems.map((item) => (
          <div 
            key={item.id}
            className="registro-item"
            onClick={() => onNavigate(item.id)}
          >
            <div className="registro-icon">{item.icon}</div>
            <div className="registro-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
            <div className="registro-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Registros;