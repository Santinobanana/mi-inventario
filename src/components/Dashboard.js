// src/components/Dashboard.js
import React from 'react';
import './Dashboard.css';

const Dashboard = ({ onNavigate, printerConnected, connectPrinter, disconnectPrinter }) => {  
  const menuItems = [
    {
      id: 'recibo',
      title: 'Recibo',
      subtitle: 'Crear recibos de productos o servicios.',
      icon: '📄'
    },
    {
      id: 'registros',
      title: 'Registros',
      subtitle: 'Registros de productos y servicios.',
      icon: '📋'
    },
    {
      id: 'listar',
      title: 'Listar Productos / Servicios',
      subtitle: 'Lista de productos y servicios',
      icon: '📋'
    },
    {
      id: 'clientes',
      title: 'Cliente',
      subtitle: 'Lista de clientes',
      icon: '👥'
    },
    {
      id: 'gestion-stock',
      title: 'Gestión & Gastos',
      subtitle: 'Stock de productos y gastos del negocio',
      icon: '📦'
    },
    {
      id: 'historico',
      title: 'Histórico',
      subtitle: 'Historia de productos y servicios.',
      icon: '🕒'
    }
  ];

return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Administrador de negocios</h1>
      </div>
      
      {/* NUEVA SECCIÓN DE CONEXIÓN DE IMPRESORA */}
      <div className="printer-connection-status">
        <span className="status-label">Conexión Impresora:</span>
        <span className={`status-indicator ${printerConnected ? 'connected' : 'disconnected'}`}>
          {printerConnected ? '🟢 Conectada' : '🔴 Desconectada'}
        </span>
        <button
          className={`connection-button ${printerConnected ? 'disconnect-btn' : 'connect-btn'}`}
          onClick={printerConnected ? disconnectPrinter : connectPrinter}
        >
          {printerConnected ? 'Desconectar' : 'Conectar'}
        </button>
      </div>
      {/* FIN NUEVA SECCIÓN */}

      <div className="menu-items">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className="menu-item"
            onClick={() => onNavigate(item.id)}
          >
            <div className="menu-icon">{item.icon}</div>
            <div className="menu-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
            <div className="menu-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Dashboard;