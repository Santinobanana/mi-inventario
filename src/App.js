// src/App.js
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Registros from './components/Registros';
import RegistroProducto from './components/RegistroProducto';
import RegistroServicio from './components/RegistroServicio';
import ListaProductosServicios from './components/ListaProductosServicios';
import ListaProductos from './components/ListaProductos';
import ServiciosLista from './components/ServiciosLista';
import Clientes from './components/Clientes';
import GenerarRecibo from './components/GenerarRecibo';
import ReciboProducto from './components/ReciboProducto';
import ReciboServicio from './components/ReciboServicio';
import Historico from './components/Historico';
import GestionStock from './components/GestionStock';
import { db, inicializarDatos } from './db/db';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Inicializar la base de datos cuando se carga la app
    inicializarDatos();
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
    console.log('Navegando a:', view);
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      
      case 'registros':
        return (
          <Registros 
            onNavigate={handleNavigate} 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'registro-producto':
        return (
          <RegistroProducto 
            onBack={() => setCurrentView('registros')}
          />
        );
      
      case 'registro-servicio':
        return (
          <RegistroServicio 
            onBack={() => setCurrentView('registros')}
          />
        );
      
      case 'listar':
        return (
          <ListaProductosServicios 
            onNavigate={handleNavigate}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'lista-productos':
        return (
          <ListaProductos 
            onBack={() => setCurrentView('listar')}
          />
        );
      
      case 'servicios-lista':
        return (
          <ServiciosLista 
            onBack={() => setCurrentView('listar')}
          />
        );
      
      case 'clientes':
        return (
          <Clientes 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'recibo':
        return (
          <GenerarRecibo 
            onNavigate={handleNavigate}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'recibo-producto':
        return (
          <ReciboProducto 
            onBack={() => setCurrentView('recibo')}
          />
        );
      
      case 'recibo-servicio':
        return (
          <ReciboServicio 
            onBack={() => setCurrentView('recibo')}
          />
        );
      
      case 'gestion-stock':
        return (
          <GestionStock 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'historico':
        return (
          <Historico 
            onBack={() => setCurrentView('dashboard')}
            onNavigate={handleNavigate}
          />
        );
      
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;