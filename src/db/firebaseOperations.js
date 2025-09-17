// src/db/firebaseOperations.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './firebase.js';

// ======================
// PRODUCTOS
// ======================

export const productosAPI = {
  // Agregar producto
  agregar: async (producto) => {
    try {
      const docRef = await addDoc(collection(db, 'productos'), {
        ...producto,
        fecha_registro: serverTimestamp()
      });
      console.log('Producto agregado con ID: ', docRef.id);
      return { id: docRef.id, ...producto };
    } catch (error) {
      console.error('Error agregando producto: ', error);
      throw error;
    }
  },

  // Obtener todos los productos
  obtenerTodos: async () => {
    try {
      const q = query(collection(db, 'productos'), orderBy('fecha_registro', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo productos: ', error);
      throw error;
    }
  },

  // Escuchar cambios en tiempo real
  escucharCambios: (callback) => {
    const q = query(collection(db, 'productos'), orderBy('fecha_registro', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const productos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(productos);
    });
  },

  // Actualizar producto
  actualizar: async (id, cambios) => {
    try {
      const docRef = doc(db, 'productos', id);
      await updateDoc(docRef, cambios);
      console.log('Producto actualizado');
    } catch (error) {
      console.error('Error actualizando producto: ', error);
      throw error;
    }
  },

  // Eliminar producto
  eliminar: async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      console.log('Producto eliminado');
    } catch (error) {
      console.error('Error eliminando producto: ', error);
      throw error;
    }
  }
};

// ======================
// SERVICIOS
// ======================

export const serviciosAPI = {
  agregar: async (servicio) => {
    try {
      const docRef = await addDoc(collection(db, 'servicios'), {
        ...servicio,
        fecha_registro: serverTimestamp()
      });
      return { id: docRef.id, ...servicio };
    } catch (error) {
      console.error('Error agregando servicio: ', error);
      throw error;
    }
  },

  obtenerTodos: async () => {
    try {
      const q = query(collection(db, 'servicios'), orderBy('fecha_registro', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo servicios: ', error);
      throw error;
    }
  },

  escucharCambios: (callback) => {
    const q = query(collection(db, 'servicios'), orderBy('fecha_registro', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const servicios = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(servicios);
    });
  },

  eliminar: async (id) => {
    try {
      await deleteDoc(doc(db, 'servicios', id));
    } catch (error) {
      console.error('Error eliminando servicio: ', error);
      throw error;
    }
  }
};

// ======================
// CLIENTES
// ======================

export const clientesAPI = {
  agregar: async (cliente) => {
    try {
      const docRef = await addDoc(collection(db, 'clientes'), {
        ...cliente,
        fecha_registro: serverTimestamp()
      });
      return { id: docRef.id, ...cliente };
    } catch (error) {
      console.error('Error agregando cliente: ', error);
      throw error;
    }
  },

  obtenerTodos: async () => {
    try {
      const q = query(collection(db, 'clientes'), orderBy('fecha_registro', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo clientes: ', error);
      throw error;
    }
  },

  escucharCambios: (callback) => {
    const q = query(collection(db, 'clientes'), orderBy('fecha_registro', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const clientes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(clientes);
    });
  },

  actualizar: async (id, cambios) => {
    try {
      const docRef = doc(db, 'clientes', id);
      await updateDoc(docRef, cambios);
    } catch (error) {
      console.error('Error actualizando cliente: ', error);
      throw error;
    }
  },

  eliminar: async (id) => {
    try {
      await deleteDoc(doc(db, 'clientes', id));
    } catch (error) {
      console.error('Error eliminando cliente: ', error);
      throw error;
    }
  }
};

// ======================
// RECIBOS
// ======================

export const recibosAPI = {
  agregar: async (recibo) => {
    try {
      const docRef = await addDoc(collection(db, 'recibos'), {
        ...recibo,
        fecha: serverTimestamp()
      });
      return { id: docRef.id, ...recibo };
    } catch (error) {
      console.error('Error agregando recibo: ', error);
      throw error;
    }
  },

  obtenerTodos: async () => {
    try {
      const q = query(collection(db, 'recibos'), orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo recibos: ', error);
      throw error;
    }
  },

  escucharCambios: (callback) => {
    const q = query(collection(db, 'recibos'), orderBy('fecha', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const recibos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(recibos);
    });
  },

  eliminar: async (id) => {
    try {
      await deleteDoc(doc(db, 'recibos', id));
    } catch (error) {
      console.error('Error eliminando recibo: ', error);
      throw error;
    }
  },

  // Obtener por tipo (productos o servicios)
  obtenerPorTipo: async (tipo) => {
    try {
      const q = query(
        collection(db, 'recibos'), 
        where('tipo', '==', tipo),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo recibos por tipo: ', error);
      throw error;
    }
  }
};

// ======================
// UTILIDADES GENERALES
// ======================

export const utilidadesAPI = {
  // Obtener siguiente número de recibo
  obtenerSiguienteNumero: async (tipo) => {
    try {
      const q = query(
        collection(db, 'recibos'),
        where('tipo', '==', tipo),
        orderBy('numero', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 1;
      }
      
      const ultimoRecibo = querySnapshot.docs[0].data();
      return (ultimoRecibo.numero || 0) + 1;
    } catch (error) {
      console.error('Error obteniendo siguiente número: ', error);
      return 1;
    }
  },

  // Estadísticas básicas
  obtenerEstadisticas: async () => {
    try {
      const [productos, servicios, clientes, recibos] = await Promise.all([
        getDocs(collection(db, 'productos')),
        getDocs(collection(db, 'servicios')),
        getDocs(collection(db, 'clientes')),
        getDocs(collection(db, 'recibos'))
      ]);

      return {
        totalProductos: productos.size,
        totalServicios: servicios.size,
        totalClientes: clientes.size,
        totalRecibos: recibos.size
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas: ', error);
      return {
        totalProductos: 0,
        totalServicios: 0,
        totalClientes: 0,
        totalRecibos: 0
      };
    }
  }
};