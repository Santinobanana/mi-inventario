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
import PrinterService from './services/PrinterService'; // Importar el servicio
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [printerConnected, setPrinterConnected] = useState(PrinterService.isConnected);

  useEffect(() => {
    // Inicializar la base de datos cuando se carga la app
    inicializarDatos();

    setPrinterConnected(PrinterService.isDeviceConnected());
  }, []);

  const handleNavigate = (view) => {
      setCurrentView(view);
      console.log('Navegando a:', view);
    };
  
  // HANDLERS DE IMPRESORA
  const handleConnectPrinter = async () => {
      try {
          await PrinterService.connect();
          setPrinterConnected(true);
          alert('Impresora conectada exitosamente.');
      } catch (error) {
          console.error("Error al conectar impresora:", error);
          alert(`Error al conectar impresora: ${error.message}. Asegúrese de que su impresora esté encendida y visible.`);
          setPrinterConnected(false);
      }
  };
  
  const handleDisconnectPrinter = () => {
      PrinterService.disconnect();
      setPrinterConnected(false);
      alert('Impresora desconectada.');
  };
  
  const handlePrintRecibo = async (recibo) => {
    try {
        if (!PrinterService.isDeviceConnected()) {
             alert('La impresora no está conectada. Conéctela desde el Dashboard.');
             return;
        }
        
        // Llamar al método del servicio para imprimir
        await PrinterService.printRecibo(recibo);
        alert('✅ Recibo enviado a la impresora.');
        
    } catch (error) {
        console.error('Error al imprimir:', error);
        alert(`❌ Error al imprimir el recibo: ${error.message}.`);
    }
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'dashboard':
        return (<Dashboard 
          onNavigate={handleNavigate} 
          printerConnected={printerConnected} // PASAR ESTADO
          connectPrinter={handleConnectPrinter} // PASAR FUNCIÓN
          disconnectPrinter={handleDisconnectPrinter} // PASAR FUNCIÓN /
          />);
      
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
            onPrint={handlePrintRecibo} // PASAR HANDLER DE IMPRESIÓN
          />
        );
      
      case 'recibo-servicio':
        return (
          <ReciboServicio 
            onBack={() => setCurrentView('recibo')}
            onPrint={handlePrintRecibo} // PASAR HANDLER DE IMPRESIÓN
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