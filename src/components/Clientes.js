// src/components/Clientes.js
import React, { useState, useEffect } from 'react';
import { productosAPI, clientesAPI, serviciosAPI, recibosAPI } from '../db/firebaseOperations.js';
import './Clientes.css';

const Clientes = ({ onBack }) => {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: ''
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      const clientesData = await clientesAPI.obtenerTodos();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: ''
    });
    setClienteEditando(null);
  };

  const abrirFormulario = (cliente = null) => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono
      });
      setClienteEditando(cliente);
    } else {
      limpiarFormulario();
    }
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
  };

  const guardarCliente = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      if (clienteEditando) {
        // Actualizar cliente existente
        await clientesAPI.actualizar(clienteEditando.id, {
          nombre: formData.nombre.trim(),
          direccion: formData.direccion.trim(),
          telefono: formData.telefono.trim()
        });
        alert('Cliente actualizado exitosamente');
      } else {
        // Crear nuevo cliente
        await clientesAPI.agregar({
          nombre: formData.nombre.trim(),
          direccion: formData.direccion.trim(),
          telefono: formData.telefono.trim(),
          fecha_registro: new Date()
        });
        alert('Cliente guardado exitosamente');
      }

      cerrarFormulario();
      await cargarClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const eliminarCliente = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await clientesAPI.eliminar(id);
        await cargarClientes();
        alert('Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="clientes">
        <div className="clientes-header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1>Cliente</h1>
        </div>
        <div className="loading">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="clientes">
      <div className="clientes-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h1>Cliente</h1>
        <button className="add-cliente-button" onClick={() => abrirFormulario()}>
          +
        </button>
      </div>

      <div className="clientes-subtitle">
        <p>Lista de clientes</p>
      </div>

      <div className="clientes-container">
        {clientes.length === 0 ? (
          <div className="empty-state">
            <p>No hay clientes registrados</p>
            <span>Agregue clientes usando el botón +</span>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id} className="cliente-card">
              <div className="cliente-header">
                <div className="cliente-nombre">{cliente.nombre}</div>
                <div className="cliente-actions">
                  <button 
                    className="edit-button"
                    onClick={() => abrirFormulario(cliente)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => eliminarCliente(cliente.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {cliente.direccion && (
                <div className="cliente-direccion">
                  📍 {cliente.direccion}
                </div>
              )}
              
              {cliente.telefono && (
                <div className="cliente-telefono">
                  📞 {cliente.telefono}
                </div>
              )}
              
              <div className="cliente-fecha">
                Registrado: {formatearFecha(cliente.fecha_registro)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="close-button" onClick={cerrarFormulario}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del cliente *"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Teléfono"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={cerrarFormulario}>
                Cancelar
              </button>
              <button className="save-button" onClick={guardarCliente}>
                {clienteEditando ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;