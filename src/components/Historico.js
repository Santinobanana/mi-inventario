// src/components/Historico.js
import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import './Historico.css';

const Historico = ({ onBack, onNavigate }) => {
  const [recibos, setRecibos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, producto, servicio
  const [filtroFecha, setFiltroFecha] = useState('todos'); // todos, hoy, mes, año
  const [isLoading, setIsLoading] = useState(true);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    cargarRecibos();
  }, []);

  const cargarRecibos = async () => {
    try {
      setIsLoading(true);
      const recibosData = await db.recibos.orderBy('fecha').reverse().toArray();
      setRecibos(recibosData);
    } catch (error) {
      console.error('Error al cargar recibos:', error);
      alert('Error al cargar el histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarRecibo = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este recibo?')) {
      try {
        await db.recibos.delete(id);
        await cargarRecibos();
        alert('Recibo eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar recibo:', error);
        alert('Error al eliminar el recibo');
      }
    }
  };

  const verDetalle = (recibo) => {
    setReciboSeleccionado(recibo);
    setMostrarDetalle(true);
  };

  const cerrarDetalle = () => {
    setMostrarDetalle(false);
    setReciboSeleccionado(null);
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

  const recibosFiltrados = recibos.filter(recibo => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && recibo.tipo !== filtroTipo) {
      return false;
    }

    // Filtro por fecha
    if (filtroFecha !== 'todos') {
      const fechaRecibo = new Date(recibo.fecha);
      const hoy = new Date();
      
      switch (filtroFecha) {
        case 'hoy':
          return fechaRecibo.toDateString() === hoy.toDateString();
        case 'mes':
          return fechaRecibo.getMonth() === hoy.getMonth() && 
                 fechaRecibo.getFullYear() === hoy.getFullYear();
        case 'año':
          return fechaRecibo.getFullYear() === hoy.getFullYear();
        default:
          return true;
      }
    }
    
    return true;
  });

  const calcularTotalGeneral = () => {
    return recibosFiltrados.reduce((total, recibo) => total + recibo.total, 0);
  };

  if (isLoading) {
    return (
      <div className="historico">
        <div className="historico-header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1>Histórico</h1>
        </div>
        <div className="loading">Cargando histórico...</div>
      </div>
    );
  }

  // Vista de detalle del recibo
  if (mostrarDetalle && reciboSeleccionado) {
    return (
      <div className="historico">
        <div className="detalle-header">
          <button className="back-button" onClick={cerrarDetalle}>←</button>
          <h1>Detalle del Recibo</h1>
          <div className="detalle-actions">
            <button className="share-button">📤</button>
            <button 
              className="delete-button"
              onClick={() => {
                eliminarRecibo(reciboSeleccionado.id);
                cerrarDetalle();
              }}
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="recibo-detalle">
          <div className="empresa-info">
            <h2>lavandería San Miguel</h2>
            <p>Chiapas 1651 colonia San Miguel de Mezquitan</p>
            <p>Teléfono: 3320164725</p>
          </div>

          <div className="recibo-info">
            <p><strong>N° {reciboSeleccionado.numero}</strong></p>
            <p><strong>Cliente:</strong> {reciboSeleccionado.cliente.nombre}</p>
            <p><strong>Fecha:</strong> {formatearFecha(reciboSeleccionado.fecha)}</p>
            {reciboSeleccionado.direccion_entrega && (
              <p><strong>Dirección de entrega:</strong> {reciboSeleccionado.direccion_entrega}</p>
            )}
          </div>

          <div className="recibo-section">
            <h3>{reciboSeleccionado.tipo === 'producto' ? 'Producto' : 'Servicio'}</h3>
            <div className="items-detalle">
              {reciboSeleccionado.items.map((item) => (
                <div key={item.id} className="item-detalle">
                  <div className="item-info">
                    {item.codigo && <span className="item-codigo">{item.codigo}</span>}
                    <span className="item-descripcion">{item.descripcion}</span>
                  </div>
                  <div className="item-calculo">
                    <span>{item.cantidad} x {formatearValor(item.valor)}</span>
                    <span className="item-total">{formatearValor(item.cantidad * item.valor)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recibo-totales">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatearValor(reciboSeleccionado.subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Descuento ({reciboSeleccionado.descuento}%):</span>
              <span>-{formatearValor((reciboSeleccionado.subtotal * reciboSeleccionado.descuento) / 100)}</span>
            </div>
            <div className="total-row final">
              <span><strong>Total a pagar:</strong></span>
              <span><strong>{formatearValor(reciboSeleccionado.total)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="historico">
      <div className="historico-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Histórico</h1>
      </div>

      <div className="historico-subtitle">
        <p>Historia de productos y servicios.</p>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-seccion">
          <label>Tipo:</label>
          <div className="filtros">
            <button 
              className={`filtro-btn ${filtroTipo === 'todos' ? 'activo' : ''}`}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos
            </button>
            <button 
              className={`filtro-btn ${filtroTipo === 'producto' ? 'activo' : ''}`}
              onClick={() => setFiltroTipo('producto')}
            >
              Productos
            </button>
            <button 
              className={`filtro-btn ${filtroTipo === 'servicio' ? 'activo' : ''}`}
              onClick={() => setFiltroTipo('servicio')}
            >
              Servicios
            </button>
          </div>
        </div>

        <div className="filtros-seccion">
          <label>Fecha:</label>
          <div className="filtros">
            <button 
              className={`filtro-btn ${filtroFecha === 'todos' ? 'activo' : ''}`}
              onClick={() => setFiltroFecha('todos')}
            >
              Todos
            </button>
            <button 
              className={`filtro-btn ${filtroFecha === 'hoy' ? 'activo' : ''}`}
              onClick={() => setFiltroFecha('hoy')}
            >
              Hoy
            </button>
            <button 
              className={`filtro-btn ${filtroFecha === 'mes' ? 'activo' : ''}`}
              onClick={() => setFiltroFecha('mes')}
            >
              Este mes
            </button>
            <button 
              className={`filtro-btn ${filtroFecha === 'año' ? 'activo' : ''}`}
              onClick={() => setFiltroFecha('año')}
            >
              Este año
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen">
          <div className="resumen-item">
            <span>Total recibos: {recibosFiltrados.length}</span>
          </div>
          <div className="resumen-item">
            <span>Total general: {formatearValor(calcularTotalGeneral())}</span>
          </div>
        </div>
      </div>

      {/* Lista de recibos */}
      <div className="recibos-container">
        {recibosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No hay recibos registrados</p>
            <span>Los recibos generados aparecerán aquí</span>
          </div>
        ) : (
          recibosFiltrados.map((recibo) => (
            <div key={recibo.id} className="recibo-card">
              <div className="recibo-card-header">
                <div className="recibo-numero">N° {recibo.numero}</div>
                <div className="recibo-tipo">
                  <span className={`tipo-badge ${recibo.tipo}`}>
                    {recibo.tipo === 'producto' ? 'Producto' : 'Servicio'}
                  </span>
                </div>
              </div>

              <div className="recibo-cliente">
                <strong>{recibo.cliente.nombre}</strong>
              </div>

              <div className="recibo-items-preview">
                {recibo.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="item-preview">
                    {item.codigo && <span>{item.codigo} - </span>}
                    <span>{item.descripcion}</span>
                    <span> (x{item.cantidad})</span>
                  </div>
                ))}
                {recibo.items.length > 2 && (
                  <div className="items-more">
                    +{recibo.items.length - 2} más...
                  </div>
                )}
              </div>

              <div className="recibo-card-footer">
                <div className="recibo-info-footer">
                  <div className="recibo-total">{formatearValor(recibo.total)}</div>
                  <div className="recibo-fecha">{formatearFecha(recibo.fecha)}</div>
                </div>
                <div className="recibo-actions">
                  <button 
                    className="ver-button"
                    onClick={() => verDetalle(recibo)}
                  >
                    👁️
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => eliminarRecibo(recibo.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Historico;