// src/components/GestionStock.js
import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import './GestionStock.css';

const GestionStock = ({ onBack }) => {
  const [vistaActual, setVistaActual] = useState('menu'); // menu, stock, gastos, agregar-gasto
  const [productos, setProductos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [movimientosStock, setMovimientosStock] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadMovimiento, setCantidadMovimiento] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada'); // entrada, salida
  const [descripcionMovimiento, setDescripcionMovimiento] = useState('');
  const [formGasto, setFormGasto] = useState({
    tipo: 'luz', // luz, agua, gas, telefono, otros
    descripcion: '',
    valor: ''
  });

  const categoriaGastos = [
    { id: 'luz', nombre: 'Luz ⚡', color: '#FFC107' },
    { id: 'agua', nombre: 'Agua 💧', color: '#2196F3' },
    { id: 'gas', nombre: 'Gas 🔥', color: '#FF5722' },
    { id: 'telefono', nombre: 'Teléfono 📞', color: '#4CAF50' },
    { id: 'otros', nombre: 'Otros 📋', color: '#9C27B0' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [productosData, gastosData, movimientosData] = await Promise.all([
        db.productos.toArray(),
        db.gastos.orderBy('fecha').reverse().toArray(),
        db.movimientos_stock.orderBy('fecha').reverse().toArray()
      ]);
      setProductos(productosData);
      setGastos(gastosData);
      setMovimientosStock(movimientosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const actualizarStock = async () => {
    if (!productoSeleccionado || !cantidadMovimiento) {
      alert('Complete todos los campos');
      return;
    }

    try {
      const producto = productos.find(p => p.id === parseInt(productoSeleccionado));
      const cantidad = parseInt(cantidadMovimiento);
      
      // Calcular nuevo stock
      let nuevoStock = producto.stock || 0;
      if (tipoMovimiento === 'entrada') {
        nuevoStock += cantidad;
      } else {
        nuevoStock -= cantidad;
        if (nuevoStock < 0) {
          alert('No hay suficiente stock');
          return;
        }
      }

      // Actualizar stock del producto
      await db.productos.update(producto.id, { stock: nuevoStock });

      // Registrar movimiento
      await db.movimientos_stock.add({
        producto_id: producto.id,
        producto_nombre: producto.descripcion,
        tipo: tipoMovimiento,
        cantidad: cantidad,
        stock_anterior: producto.stock || 0,
        stock_nuevo: nuevoStock,
        descripcion: descripcionMovimiento,
        fecha: new Date()
      });

      // Limpiar formulario
      setProductoSeleccionado('');
      setCantidadMovimiento('');
      setDescripcionMovimiento('');
      
      // Recargar datos
      await cargarDatos();
      alert('Stock actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar stock:', error);
      alert('Error al actualizar el stock');
    }
  };

  const agregarGasto = async () => {
    if (!formGasto.descripcion || !formGasto.valor) {
      alert('Complete todos los campos');
      return;
    }

    try {
      const categoria = categoriaGastos.find(c => c.id === formGasto.tipo);
      
      await db.gastos.add({
        tipo: formGasto.tipo,
        categoria: categoria.nombre,
        descripcion: formGasto.descripcion,
        valor: parseFloat(formGasto.valor),
        fecha: new Date()
      });

      // Limpiar formulario
      setFormGasto({
        tipo: 'luz',
        descripcion: '',
        valor: ''
      });

      await cargarDatos();
      alert('Gasto registrado exitosamente');
      setVistaActual('gastos');

    } catch (error) {
      console.error('Error al registrar gasto:', error);
      alert('Error al registrar el gasto');
    }
  };

  const eliminarGasto = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este gasto?')) {
      try {
        await db.gastos.delete(id);
        await cargarDatos();
        alert('Gasto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar gasto:', error);
        alert('Error al eliminar el gasto');
      }
    }
  };

  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
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

  const renderMenu = () => (
    <div className="gestion-stock">
      <div className="stock-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>Gestión</h1>
      </div>

      <div className="stock-subtitle">
        <p>Stock de productos y gastos del negocio</p>
      </div>

      <div className="menu-options">
        <div className="option-card" onClick={() => setVistaActual('stock')}>
          <div className="option-icon">📦</div>
          <div className="option-content">
            <h3>Gestión de Stock</h3>
            <p>Agregar y controlar inventario</p>
          </div>
          <div className="option-arrow">→</div>
        </div>

        <div className="option-card" onClick={() => setVistaActual('gastos')}>
          <div className="option-icon">💰</div>
          <div className="option-content">
            <h3>Gastos del Negocio</h3>
            <p>Luz, agua, gas, teléfono y más</p>
          </div>
          <div className="option-arrow">→</div>
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="gestion-stock">
      <div className="stock-header">
        <button className="back-button" onClick={() => setVistaActual('menu')}>←</button>
        <h1>Gestión de Stock</h1>
      </div>

      {/* Formulario de movimiento */}
      <div className="form-container">
        <div className="form-group">
          <label>Producto:</label>
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccionar producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.descripcion} (Stock: {producto.stock || 0})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de movimiento:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                value="entrada"
                checked={tipoMovimiento === 'entrada'}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              />
              <span>Entrada (+)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="salida"
                checked={tipoMovimiento === 'salida'}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              />
              <span>Salida (-)</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Cantidad:</label>
          <input
            type="number"
            value={cantidadMovimiento}
            onChange={(e) => setCantidadMovimiento(e.target.value)}
            placeholder="Cantidad"
            className="form-input"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Descripción (opcional):</label>
          <input
            type="text"
            value={descripcionMovimiento}
            onChange={(e) => setDescripcionMovimiento(e.target.value)}
            placeholder="Ej: Compra, Venta, Ajuste de inventario"
            className="form-input"
          />
        </div>

        <button className="action-button" onClick={actualizarStock}>
          Actualizar Stock
        </button>
      </div>

      {/* Lista de movimientos recientes */}
      <div className="movimientos-container">
        <h3>Movimientos Recientes</h3>
        {movimientosStock.slice(0, 10).map((movimiento) => (
          <div key={movimiento.id} className="movimiento-card">
            <div className="movimiento-info">
              <div className="producto-nombre">{movimiento.producto_nombre}</div>
              <div className="movimiento-detalle">
                <span className={`movimiento-tipo ${movimiento.tipo}`}>
                  {movimiento.tipo === 'entrada' ? '+' : '-'}{movimiento.cantidad}
                </span>
                <span className="stock-info">
                  {movimiento.stock_anterior} → {movimiento.stock_nuevo}
                </span>
              </div>
              {movimiento.descripcion && (
                <div className="movimiento-descripcion">{movimiento.descripcion}</div>
              )}
            </div>
            <div className="movimiento-fecha">{formatearFecha(movimiento.fecha)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGastos = () => (
    <div className="gestion-stock">
      <div className="stock-header">
        <button className="back-button" onClick={() => setVistaActual('menu')}>←</button>
        <h1>Gastos del Negocio</h1>
        <button className="add-button" onClick={() => setVistaActual('agregar-gasto')}>+</button>
      </div>

      <div className="gastos-resumen">
        <div className="resumen-card">
          <span>Total gastos: {gastos.length}</span>
        </div>
        <div className="resumen-card">
          <span>Total: {formatearValor(gastos.reduce((total, gasto) => total + gasto.valor, 0))}</span>
        </div>
      </div>

      <div className="gastos-container">
        {gastos.map((gasto) => {
          const categoria = categoriaGastos.find(c => c.id === gasto.tipo);
          return (
            <div key={gasto.id} className="gasto-card">
              <div className="gasto-header">
                <div className="gasto-categoria" style={{ backgroundColor: categoria?.color + '20', color: categoria?.color }}>
                  {categoria?.nombre || gasto.categoria}
                </div>
                <button className="delete-button" onClick={() => eliminarGasto(gasto.id)}>🗑️</button>
              </div>
              <div className="gasto-descripcion">{gasto.descripcion}</div>
              <div className="gasto-footer">
                <div className="gasto-valor">{formatearValor(gasto.valor)}</div>
                <div className="gasto-fecha">{formatearFecha(gasto.fecha)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAgregarGasto = () => (
    <div className="gestion-stock">
      <div className="stock-header">
        <button className="back-button" onClick={() => setVistaActual('gastos')}>←</button>
        <h1>Nuevo Gasto</h1>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label>Categoría:</label>
          <div className="categorias-grid">
            {categoriaGastos.map((categoria) => (
              <div
                key={categoria.id}
                className={`categoria-card ${formGasto.tipo === categoria.id ? 'selected' : ''}`}
                onClick={() => setFormGasto(prev => ({ ...prev, tipo: categoria.id }))}
                style={{ borderColor: categoria.color }}
              >
                <div className="categoria-nombre">{categoria.nombre}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <input
            type="text"
            value={formGasto.descripcion}
            onChange={(e) => setFormGasto(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Ej: Factura de luz enero 2025"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Valor:</label>
          <input
            type="number"
            value={formGasto.valor}
            onChange={(e) => setFormGasto(prev => ({ ...prev, valor: e.target.value }))}
            placeholder="0.00"
            className="form-input"
            step="0.01"
            min="0"
          />
        </div>

        <button className="action-button" onClick={agregarGasto}>
          Registrar Gasto
        </button>
      </div>
    </div>
  );

  switch (vistaActual) {
    case 'stock':
      return renderStock();
    case 'gastos':
      return renderGastos();
    case 'agregar-gasto':
      return renderAgregarGasto();
    default:
      return renderMenu();
  }
};

export default GestionStock;