// src/components/ReciboProducto.js
import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import './ReciboProducto.css';

const ReciboProducto = ({ onBack }) => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const [reciboGenerado, setReciboGenerado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesData, productosData] = await Promise.all([
        db.clientes.toArray(),
        db.productos.toArray()
      ]);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    }
  };

  const agregarProducto = (producto) => {
    const existe = productosSeleccionados.find(p => p.id === producto.id);
    if (existe) {
      setProductosSeleccionados(prev =>
        prev.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      );
    } else {
      setProductosSeleccionados(prev => [
        ...prev,
        { ...producto, cantidad: 1 }
      ]);
    }
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
    } else {
      setProductosSeleccionados(prev =>
        prev.map(p =>
          p.id === id ? { ...p, cantidad: nuevaCantidad } : p
        )
      );
    }
  };

  const calcularSubtotal = () => {
    return productosSeleccionados.reduce((total, producto) => {
      return total + (producto.valor * producto.cantidad);
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

    if (productosSeleccionados.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }

    try {
      const cliente = clientes.find(c => c.id === parseInt(clienteSeleccionado));
      const numeroRecibo = Date.now();

      const recibo = {
        numero: numeroRecibo,
        cliente_id: cliente.id,
        cliente: cliente,
        tipo: 'producto',
        items: productosSeleccionados,
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
    setProductosSeleccionados([]);
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
      <div className="recibo-producto">
        <div className="recibo-preview">
          <div className="recibo-header-preview">
            <button className="back-button" onClick={() => setMostrarRecibo(false)}>
              ←
            </button>
            <h1>Recibo del producto</h1>
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
              <h3>Producto</h3>
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
    <div className="recibo-producto">
      <div className="recibo-producto-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Recibo del producto</h1>
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

        {/* Selección de productos */}
        <div className="form-group">
          <label>Productos disponibles:</label>
          <div className="productos-grid">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="producto-card-select"
                onClick={() => agregarProducto(producto)}
              >
                <div className="producto-codigo">{producto.codigo}</div>
                <div className="producto-descripcion">{producto.descripcion}</div>
                <div className="producto-valor">{formatearValor(producto.valor)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos seleccionados */}
        {productosSeleccionados.length > 0 && (
          <div className="form-group">
            <label>Productos seleccionados:</label>
            {productosSeleccionados.map((producto) => (
              <div key={producto.id} className="producto-seleccionado">
                <span>{producto.descripcion}</span>
                <div className="cantidad-controls">
                  <button onClick={() => cambiarCantidad(producto.id, producto.cantidad - 1)}>-</button>
                  <span>{producto.cantidad}</span>
                  <button onClick={() => cambiarCantidad(producto.id, producto.cantidad + 1)}>+</button>
                </div>
                <span>{formatearValor(producto.valor * producto.cantidad)}</span>
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
        {productosSeleccionados.length > 0 && (
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

export default ReciboProducto;