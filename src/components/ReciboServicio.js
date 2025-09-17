// src/components/ReciboServicio.js
import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import './ReciboServicio.css';

const ReciboServicio = ({ onBack }) => {
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const [reciboGenerado, setReciboGenerado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesData, serviciosData] = await Promise.all([
        db.clientes.toArray(),
        db.servicios.toArray()
      ]);
      setClientes(clientesData);
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    }
  };

  const agregarServicio = (servicio) => {
    const existe = serviciosSeleccionados.find(s => s.id === servicio.id);
    if (existe) {
      setServiciosSeleccionados(prev =>
        prev.map(s =>
          s.id === servicio.id
            ? { ...s, cantidad: s.cantidad + 1 }
            : s
        )
      );
    } else {
      setServiciosSeleccionados(prev => [
        ...prev,
        { ...servicio, cantidad: 1 }
      ]);
    }
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setServiciosSeleccionados(prev => prev.filter(s => s.id !== id));
    } else {
      setServiciosSeleccionados(prev =>
        prev.map(s =>
          s.id === id ? { ...s, cantidad: nuevaCantidad } : s
        )
      );
    }
  };

  const calcularSubtotal = () => {
    return serviciosSeleccionados.reduce((total, servicio) => {
      return total + (servicio.valor * servicio.cantidad);
    }, 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const descuentoValor = (subtotal * descuento) / 100;
    return subtotal - descuentoValor;
  };

  const generarRecibo = async () => {
    if (!clienteSeleccionado) {
      alert('Seleccione un cliente');
      return;
    }

    if (serviciosSeleccionados.length === 0) {
      alert('Agregue al menos un servicio');
      return;
    }

    try {
      const cliente = clientes.find(c => c.id === parseInt(clienteSeleccionado));
      const numeroRecibo = Date.now();

      const recibo = {
        numero: numeroRecibo,
        cliente_id: cliente.id,
        cliente: cliente,
        tipo: 'servicio',
        items: serviciosSeleccionados,
        direccion_entrega: direccionEntrega,
        subtotal: calcularSubtotal(),
        descuento: descuento,
        total: calcularTotal(),
        fecha: new Date()
      };

      await db.recibos.add(recibo);
      setReciboGenerado(recibo);
      setMostrarRecibo(true);

    } catch (error) {
      console.error('Error al generar recibo:', error);
      alert('Error al generar el recibo');
    }
  };

  const limpiarFormulario = () => {
    setClienteSeleccionado('');
    setServiciosSeleccionados([]);
    setDireccionEntrega('');
    setDescuento(0);
    setMostrarRecibo(false);
    setReciboGenerado(null);
  };

  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  if (mostrarRecibo && reciboGenerado) {
    return (
      <div className="recibo-servicio">
        <div className="recibo-preview">
          <div className="recibo-header-preview">
            <button className="back-button" onClick={() => setMostrarRecibo(false)}>
              ←
            </button>
            <h1>Recibo de Servicio</h1>
            <div className="recibo-actions">
              <button className="share-button">📤</button>
              <button className="delete-button">🗑️</button>
            </div>
          </div>

          <div className="recibo-content">
            <div className="empresa-info">
              <h2>lavandería San Miguel</h2>
              <p>Chiapas 1651 colonia San Miguel de Mezquitan</p>
              <p>Teléfono: 3320164725</p>
            </div>

            <div className="recibo-details">
              <p><strong>N° {reciboGenerado.numero}</strong></p>
              <p><strong>Cliente:</strong> {reciboGenerado.cliente.nombre}</p>
              <p><strong>Dirección de entrega:</strong> {direccionEntrega || 'No especificada'}</p>
            </div>

            <div className="recibo-section">
              <h3>Servicio</h3>
              <div className="items-list">
                {reciboGenerado.items.map((item) => (
                  <div key={item.id} className="item-row">
                    <span>{item.descripcion}</span>
                    <span>{item.cantidad} x {formatearValor(item.valor)}</span>
                    <span>{formatearValor(item.cantidad * item.valor)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recibo-totals">
              <div className="total-row">
                <span>Total {formatearValor(reciboGenerado.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Descuento: {reciboGenerado.descuento}%</span>
              </div>
              <div className="total-row final">
                <span><strong>Total a pagar $ : {formatearValor(reciboGenerado.total)}</strong></span>
              </div>
            </div>
          </div>

          <button className="new-recibo-button" onClick={limpiarFormulario}>
            + Agregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recibo-servicio">
      <div className="recibo-servicio-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Recibo de Servicio</h1>
      </div>

      <div className="form-container">
        {/* Selección de cliente */}
        <div className="form-group">
          <label>Cliente:</label>
          <select
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección de entrega */}
        <div className="form-group">
          <label>Dirección de entrega:</label>
          <input
            type="text"
            value={direccionEntrega}
            onChange={(e) => setDireccionEntrega(e.target.value)}
            placeholder="Dirección de entrega"
            className="form-input"
          />
        </div>

        {/* Selección de servicios */}
        <div className="form-group">
          <label>Servicios disponibles:</label>
          <div className="servicios-grid">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="servicio-card-select"
                onClick={() => agregarServicio(servicio)}
              >
                <div className="servicio-badge">Servicio</div>
                <div className="servicio-descripcion">{servicio.descripcion}</div>
                <div className="servicio-valor">{formatearValor(servicio.valor)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios seleccionados */}
        {serviciosSeleccionados.length > 0 && (
          <div className="form-group">
            <label>Servicios seleccionados:</label>
            {serviciosSeleccionados.map((servicio) => (
              <div key={servicio.id} className="servicio-seleccionado">
                <span>{servicio.descripcion}</span>
                <div className="cantidad-controls">
                  <button onClick={() => cambiarCantidad(servicio.id, servicio.cantidad - 1)}>-</button>
                  <span>{servicio.cantidad}</span>
                  <button onClick={() => cambiarCantidad(servicio.id, servicio.cantidad + 1)}>+</button>
                </div>
                <span>{formatearValor(servicio.valor * servicio.cantidad)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Descuento */}
        <div className="form-group">
          <label>Descuento (%):</label>
          <input
            type="number"
            value={descuento}
            onChange={(e) => setDescuento(Math.max(0, Math.min(100, e.target.value)))}
            placeholder="0"
            className="form-input"
            min="0"
            max="100"
          />
        </div>

        {/* Totales */}
        {serviciosSeleccionados.length > 0 && (
          <div className="totales-preview">
            <div>Subtotal: {formatearValor(calcularSubtotal())}</div>
            <div>Descuento: {descuento}%</div>
            <div><strong>Total: {formatearValor(calcularTotal())}</strong></div>
          </div>
        )}

        <button className="generar-button" onClick={generarRecibo}>
          Generar Recibo
        </button>
      </div>
    </div>
  );
};

export default ReciboServicio;