import { verificarStockBajo } from './productos.js';

// Referencias DOM
const tbody = document.getElementById('tabla-productos');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');

// Mostrar mensajes temporales
export function mostrarMensaje(texto, tipo = 'exito') {
    const elemento = tipo === 'error' ? mensajeError : mensajeExito;
    elemento.textContent = texto;
    elemento.style.display = 'block';
    
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 3000);
}

// Renderizar tabla de productos
export function renderizarProductos(productos) {
    if (!tbody) return;
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay productos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(producto => {
        const stockBajo = verificarStockBajo(producto);
        const estado = stockBajo ? '⚠️ Stock Bajo' : '✅ Normal';
        const estadoColor = stockBajo ? 'orange' : 'green';
        
        return `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.stockMinimo}</td>
                <td style="color: ${estadoColor}; font-weight: bold;">${estado}</td>
                <td>
                    <button onclick="window.editarProducto('${producto.codigo}')">✏️ Editar</button>
                    <button onclick="window.eliminarProductoHandler('${producto.codigo}')">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Limpiar formulario
export function limpiarFormulario() {
    const form = document.getElementById('form-producto');
    if (form) {
        form.reset();
        document.getElementById('codigo').value = '';
        document.getElementById('nombre').value = '';
        document.getElementById('cantidad').value = '0';
        document.getElementById('precio').value = '0';
        document.getElementById('stock-minimo').value = '5';
    }
}

// Cargar datos en modal de edición
export function cargarDatosEnModal(producto) {
    document.getElementById('edit-codigo-original').value = producto.codigo;
    document.getElementById('edit-codigo').value = producto.codigo;
    document.getElementById('edit-nombre').value = producto.nombre;
    document.getElementById('edit-cantidad').value = producto.cantidad;
    document.getElementById('edit-precio').value = producto.precio;
    document.getElementById('edit-stock-minimo').value = producto.stockMinimo;
}