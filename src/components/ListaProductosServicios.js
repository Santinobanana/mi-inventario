// src/components/ListaProductosServicios.js
import React from 'react';
import './ListaProductosServicios.css';

const ListaProductosServicios = ({ onNavigate, onBack }) => {
  const listaItems = [
    {
      id: 'lista-productos',
      title: 'Lista de Productos',
      subtitle: 'Listar todos los productos',
      icon: '📋'
    },
    {
      id: 'servicios-lista',
      title: 'Servicios de lista',
      subtitle: 'Listar todos los servicios',
      icon: '📋'
    }
  ];

  return (
    <div className="lista-productos-servicios">
      <div className="lista-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Listar Productos / Servicios</h1>
      </div>
      
      <div className="lista-subtitle">
        <p>Lista de productos y servicios</p>
      </div>

      <div className="lista-items">
        {listaItems.map((item) => (
          <div 
            key={item.id}
            className="lista-item"
            onClick={() => onNavigate(item.id)}
          >
            <div className="lista-icon">{item.icon}</div>
            <div className="lista-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
            <div className="lista-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaProductosServicios;