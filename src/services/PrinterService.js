// src/services/PrinterService.js
class PrinterService {
  constructor() {
    this.device = null;
    this.isConnected = false;
    this.characteristic = null;
  }

  // Conectar a impresora Bluetooth
async connect() {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth no soportado en este navegador');
      }

      console.log('Buscando impresora Bluetooth...');
      
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // <-- CORRECCIÓN 1: Permite ver todos los dispositivos

        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Servicio de impresión común (POS)
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Servicio alternativo 1
          '00001101-0000-1000-8000-00805f9b34fb'  // CORRECCIÓN 2: UUID Típico de SPP (Serial Port Profile)
        ]
      });

      console.log('Dispositivo encontrado:', this.device.name);

      // CORRECCIÓN 3: Asignar a 'this.server' para que esté disponible globalmente en la clase
      this.server = await this.device.gatt.connect(); 
      console.log('Conectado al servidor GATT');

      // Buscar servicio de impresión (se eliminó 'let service;')
      try {
        this.service = await this.server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
        console.log('Servicio de impresión estándar encontrado.');
      } catch (error) {
        console.warn('Servicio POS estándar (18F0) no encontrado. Intentando UUID alternativo (SPP):');
        const alternativeUUID = '00001101-0000-1000-8000-00805f9b34fb';
        this.service = await this.server.getPrimaryService(alternativeUUID); // Asignación correcta
      }

      // Obtener característica de escritura
      const characteristics = await this.service.getCharacteristics();
      this.characteristic = characteristics.find(c => c.properties.write);

      if (!this.characteristic) {
          throw new Error("No se encontró una característica de escritura válida en el servicio.");
      }
      
      this.isConnected = true;
      console.log('Impresora conectada exitosamente');
      return true;

    } catch (error) {
      console.error('Error conectando impresora:', error);
      this.isConnected = false;
      this.disconnect(); // Limpiar la conexión si el error ocurre a mitad
      throw error;
    }
  }

  // Desconectar impresora
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.characteristic = null;
    console.log('Impresora desconectada');
  }

  // Enviar comando ESC/POS a la impresora
  async sendCommand(command) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Impresora no conectada');
    }

    try {
      // Dividir comando en chunks de máximo 20 bytes (límite Bluetooth LE)
      const chunkSize = 20;
      for (let i = 0; i < command.length; i += chunkSize) {
        const chunk = command.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        // Pequeña pausa entre chunks
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error('Error enviando comando:', error);
      throw error;
    }
  }

  // Imprimir texto
  async printText(text, options = {}) {
    const { align = 'left', fontSize = 'normal', bold = false } = options;
    
    let command = new Uint8Array(0);

    // Alineación
    if (align === 'center') {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x61, 0x01]));
    } else if (align === 'right') {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x61, 0x02]));
    } else {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x61, 0x00]));
    }

    // Tamaño de fuente
    if (fontSize === 'large') {
      command = this.concatArrays(command, new Uint8Array([0x1D, 0x21, 0x11]));
    } else if (fontSize === 'small') {
      command = this.concatArrays(command, new Uint8Array([0x1D, 0x21, 0x00]));
    }

    // Negrita
    if (bold) {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x45, 0x01]));
    }

    // Texto
    const textBytes = new TextEncoder().encode(text);
    command = this.concatArrays(command, textBytes);

    // Resetear formato
    command = this.concatArrays(command, new Uint8Array([0x1B, 0x45, 0x00])); // Quitar negrita
    command = this.concatArrays(command, new Uint8Array([0x1D, 0x21, 0x00])); // Tamaño normal

    await this.sendCommand(command);
  }

  // Imprimir línea separadora
  async printSeparator() {
    await this.printText('--------------------------------', { align: 'center' });
    await this.printNewLine();
  }

  // Nueva línea
  async printNewLine(lines = 1) {
    const command = new Uint8Array(lines).fill(0x0A);
    await this.sendCommand(command);
  }

  // Cortar papel
  async cutPaper() {
    const command = new Uint8Array([0x1D, 0x56, 0x00]);
    await this.sendCommand(command);
  }

  // Abrir cajón (si está conectado)
  async openDrawer() {
    const command = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
    await this.sendCommand(command);
  }

  // Utilitario para concatenar arrays
  concatArrays(a, b) {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  }

  // Imprimir recibo completo
  async printRecibo(recibo) {
    try {
      // Encabezado
      await this.printText('LAVANDERIA SAN MIGUEL', { align: 'center', fontSize: 'large', bold: true });
      await this.printNewLine();
      await this.printText('Calle Principal #123', { align: 'center' });
      await this.printText('Tel: (555) 123-4567', { align: 'center' });
      await this.printNewLine();
      await this.printSeparator();

      // Información del recibo
      await this.printText(`RECIBO #${recibo.numero}`, { align: 'center', bold: true });
      await this.printText(`Fecha: ${new Date(recibo.fecha).toLocaleDateString('es-ES')}`, { align: 'left' });
      await this.printText(`Cliente: ${recibo.cliente.nombre}`, { align: 'left' });
      
      if (recibo.direccionEntrega) {
        await this.printText(`Direccion: ${recibo.direccionEntrega}`, { align: 'left' });
      }
      
      await this.printNewLine();
      await this.printSeparator();

      // Items
      await this.printText('DETALLE:', { bold: true });
      await this.printNewLine();

      for (const item of recibo.items) {
        const itemText = `${item.descripcion || item.codigo}`;
        const cantidadText = `${item.cantidad}x`;
        const precioText = `$${item.valor.toFixed(2)}`;
        const totalText = `$${(item.cantidad * item.valor).toFixed(2)}`;

        await this.printText(itemText);
        await this.printText(`  ${cantidadText} ${precioText} = ${totalText}`, { align: 'right' });
      }

      await this.printNewLine();
      await this.printSeparator();

      // Totales
      await this.printText(`Subtotal: $${recibo.subtotal.toFixed(2)}`, { align: 'right' });
      
      if (recibo.descuento > 0) {
        await this.printText(`Descuento: -$${recibo.descuento.toFixed(2)}`, { align: 'right' });
      }
      
      await this.printText(`TOTAL: $${recibo.total.toFixed(2)}`, { align: 'right', bold: true, fontSize: 'large' });

      await this.printNewLine();
      await this.printSeparator();
      await this.printText('¡Gracias por su preferencia!', { align: 'center' });
      await this.printNewLine(3);

      // Cortar papel
      await this.cutPaper();

      console.log('Recibo impreso exitosamente');

    } catch (error) {
      console.error('Error imprimiendo recibo:', error);
      throw error;
    }
  }

  // Verificar estado de conexión
  isDeviceConnected() {
    return this.isConnected && this.device && this.device.gatt.connected;
  }
}

export default new PrinterService();