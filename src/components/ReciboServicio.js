// src/components/ReciboServicio.js
import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import './ReciboServicio.css';

const ReciboServicio = ({ onBack }) => {
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [servicioCompleto, setServicioCompleto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [esADomicilio, setEsADomicilio] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const [reciboGenerado, setReciboGenerado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesData, serviciosData, productosData] = await Promise.all([
        db.clientes.toArray(),
        db.servicios.toArray(),
        db.productos.toArray()
      ]);
      setClientes(clientesData);
      setServicios(serviciosData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    }
  };

  const handleServicioCompletoChange = (checked) => {
    setServicioCompleto(checked);
    if (!checked) {
      setClienteSeleccionado('');
      setEsADomicilio(false);
      setDireccionEntrega('');
    }
  };

  const handleClienteChange = (clienteId) => {
    setClienteSeleccionado(clienteId);
    if (clienteId && esADomicilio) {
      const cliente = clientes.find(c => c.id === parseInt(clienteId));
      if (cliente && cliente.direccion) {
        setDireccionEntrega(cliente.direccion);
      }
    } else if (!esADomicilio) {
      setDireccionEntrega('');
    }
  };

  const handleDomicilioChange = (checked) => {
    setEsADomicilio(checked);
    if (!checked) {
      setDireccionEntrega('');
    } else if (clienteSeleccionado) {
      const cliente = clientes.find(c => c.id === parseInt(clienteSeleccionado));
      if (cliente && cliente.direccion) {
        setDireccionEntrega(cliente.direccion);
      }
    }
  };

  const agregarItem = (item, tipo) => {
    const itemCompleto = { ...item, tipo_item: tipo };
    const existe = itemsSeleccionados.find(i => i.id === item.id && i.tipo_item === tipo);
    
    if (existe) {
      setItemsSeleccionados(prev =>
        prev.map(i =>
          i.id === item.id && i.tipo_item === tipo
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      setItemsSeleccionados(prev => [
        ...prev,
        { ...itemCompleto, cantidad: 1 }
      ]);
    }
  };

  const cambiarCantidad = (id, tipo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setItemsSeleccionados(prev => prev.filter(i => !(i.id === id && i.tipo_item === tipo)));
    } else {
      setItemsSeleccionados(prev =>
        prev.map(i =>
          i.id === id && i.tipo_item === tipo ? { ...i, cantidad: nuevaCantidad } : i
        )
      );
    }
  };

  const agregarServicio = (servicio) => {
    agregarItem(servicio, 'servicio');
  };

  const agregarProducto = (producto) => {
    agregarItem(producto, 'producto');
  };

  const calcularSubtotal = () => {
    return itemsSeleccionados.reduce((total, item) => {
      return total + (item.valor * item.cantidad);
    }, 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const descuentoValor = (subtotal * descuento) / 100;
    return subtotal - descuentoValor;
  };

  const generarRecibo = async () => {
    // Solo validar cliente si servicio completo está marcado
    if (servicioCompleto && !clienteSeleccionado) {
      alert('Seleccione un cliente');
      return;
    }

    if (itemsSeleccionados.length === 0) {
      alert('Agregue al menos un servicio o producto');
      return;
    }

    try {
      const numeroRecibo = Date.now();
      let cliente;
      if (!clienteSeleccionado) {
        cliente = {
          id: 0,
          nombre: 'Cliente General'
        };
      } else {
        cliente = clientes.find(c => c.id === parseInt(clienteSeleccionado));
      }

      const recibo = {
        numero: numeroRecibo,
        cliente_id: cliente ? cliente.id : null,
        cliente: cliente,
        tipo: 'servicio',
        items: itemsSeleccionados,
        es_a_domicilio: esADomicilio,
        direccion_entrega: esADomicilio ? direccionEntrega : '',
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
    setServicioCompleto(false);
    setClienteSeleccionado('');
    setEsADomicilio(false);
    setDireccionEntrega('');
    setItemsSeleccionados([]);
    setDescuento(0);
    setMostrarRecibo(false);
    setReciboGenerado(null);
  };

  const imprimirRecibo = () => {
    const ventanaImpresion = window.open('', '_blank');
    const reciboHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo N° ${reciboGenerado.numero}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            margin: 0; 
            padding: 20px;
            width: 58mm;
          }
          .centro { text-align: center; }
          .negrita { font-weight: bold; }
          .empresa { margin-bottom: 10px; }
          .linea { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item { margin: 2px 0; }
          .total { border-top: 2px solid #000; padding-top: 5px; }
          .espaciado { margin: 15px 0; }
          @media print {
            body { margin: 0; }
            @page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="centro empresa">
          <div class="negrita">LAVANDERIA SAN MIGUEL</div>
          <div>Chiapas 1651 colonia San Miguel de Mezquitan</div>
          <div>Tel: 3320164725</div>
        </div>
        
        <div class="linea"></div>
        
        <div>
          <div class="negrita">RECIBO N° ${reciboGenerado.numero}</div>
          ${reciboGenerado.cliente ? 
            `<div>Cliente: ${reciboGenerado.cliente.nombre}</div>` : 
            '<div>Venta directa</div>'}
          <div>Fecha: ${new Date(reciboGenerado.fecha).toLocaleString('es-ES')}</div>
          ${reciboGenerado.cliente ? 
            `<div>Modalidad: ${reciboGenerado.es_a_domicilio ? 'A domicilio' : 'En local'}</div>` : ''}
          ${reciboGenerado.es_a_domicilio && reciboGenerado.direccion_entrega ? 
            `<div>Direccion: ${reciboGenerado.direccion_entrega}</div>` : ''}
        </div>
        
        <div class="linea"></div>
        
        <div>
          ${reciboGenerado.items.map(item => `
            <div class="item">
              ${item.descripcion} (${item.tipo_item})
              <br>
              ${item.cantidad} x $${item.valor.toFixed(2)} = $${(item.cantidad * item.valor).toFixed(2)}
            </div>
          `).join('')}
        </div>
        
        <div class="linea"></div>
        
        <div>
          <div>Subtotal: $${reciboGenerado.subtotal.toFixed(2)}</div>
          ${reciboGenerado.descuento > 0 ? 
            `<div>Descuento (${reciboGenerado.descuento}%): -$${((reciboGenerado.subtotal * reciboGenerado.descuento) / 100).toFixed(2)}</div>` : ''}
          <div class="total negrita">TOTAL: $${reciboGenerado.total.toFixed(2)}</div>
        </div>
        
        <div class="espaciado centro">
          <div>¡Gracias por su preferencia!</div>
        </div>
      </body>
      </html>
    `;

    ventanaImpresion.document.write(reciboHTML);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    
    setTimeout(() => {
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 250);
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
              <button className="print-button" onClick={imprimirRecibo} title="Imprimir recibo">
                🖨️
              </button>
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
              {reciboGenerado.cliente ? (
                <>
                  <p><strong>Cliente:</strong> {reciboGenerado.cliente.nombre}</p>
                  <p><strong>Modalidad:</strong> {reciboGenerado.es_a_domicilio ? 'A domicilio' : 'En local'}</p>
                  {reciboGenerado.es_a_domicilio && reciboGenerado.direccion_entrega && (
                    <p><strong>Dirección de servicio:</strong> {reciboGenerado.direccion_entrega}</p>
                  )}
                </>
              ) : (
                <p><strong>Tipo:</strong> Venta directa</p>
              )}
            </div>

            <div className="recibo-section">
              <h3>Servicios y Productos</h3>
              <div className="items-list">
                {reciboGenerado.items.map((item, index) => (
                  <div key={`${item.id}-${item.tipo_item}-${index}`} className="item-row">
                    <div className="item-info">
                      <span className="item-descripcion">{item.descripcion}</span>
                      <span className={`item-tipo ${item.tipo_item}`}>
                        {item.tipo_item === 'producto' ? 'Producto' : 'Servicio'}
                      </span>
                    </div>
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
        {/* PASO 1: Checkbox servicio completo */}
        <div className="form-group paso-principal">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="servicioCompleto"
              checked={servicioCompleto}
              onChange={(e) => handleServicioCompletoChange(e.target.checked)}
              className="form-checkbox"
            />
            <label htmlFor="servicioCompleto" className="checkbox-label paso-label">
              Servicio completo
            </label>
          </div>
        </div>

        {/* PASO 2: Selección de cliente - solo si servicio completo está marcado */}
        {servicioCompleto && (
          <div className="form-group">
            <label>Cliente:</label>
            <select
              value={clienteSeleccionado}
              onChange={(e) => handleClienteChange(e.target.value)}
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
        )}

        {/* PASO 3: Checkbox a domicilio - solo si servicio completo está marcado */}
        {servicioCompleto && (
          <div className="form-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="esADomicilioServicio"
                checked={esADomicilio}
                onChange={(e) => handleDomicilioChange(e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor="esADomicilioServicio" className="checkbox-label">
                Es a domicilio
              </label>
            </div>
          </div>
        )}

        {/* PASO 4: Dirección de servicio - solo si servicio completo Y es a domicilio */}
        {servicioCompleto && esADomicilio && (
          <div className="form-group">
            <label>Dirección de servicio:</label>
            <input
              type="text"
              value={direccionEntrega}
              onChange={(e) => setDireccionEntrega(e.target.value)}
              placeholder="Dirección donde se realizará el servicio"
              className="form-input"
            />
          </div>
        )}

        {/* Selección de servicios disponibles */}
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

        {/* Selección de productos disponibles */}
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

        {/* Items seleccionados */}
        {itemsSeleccionados.length > 0 && (
          <div className="form-group">
            <label>Items seleccionados:</label>
            {itemsSeleccionados.map((item) => (
              <div key={`${item.id}-${item.tipo_item}`} className="item-seleccionado">
                <div className="item-info">
                  <span className="item-nombre">{item.descripcion}</span>
                  <span className={`item-tipo ${item.tipo_item}`}>
                    {item.tipo_item === 'producto' ? 'Producto' : 'Servicio'}
                  </span>
                </div>
                <div className="cantidad-controls">
                  <button onClick={() => cambiarCantidad(item.id, item.tipo_item, item.cantidad - 1)}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, item.tipo_item, item.cantidad + 1)}>+</button>
                </div>
                <span>{formatearValor(item.valor * item.cantidad)}</span>
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
        {itemsSeleccionados.length > 0 && (
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