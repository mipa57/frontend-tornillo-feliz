// Configuración - Asegúrate que apunte al backend
const API_URL = 'http://localhost:3000/api';  // ← Este es el backend

// Elementos del DOM
const formProducto = document.getElementById('form-producto');
const btnCancelar = document.getElementById('btn-cancelar');
const tbody = document.getElementById('tabla-productos');

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Frontend corriendo en:', window.location.href);
    console.log('Conectando a backend en:', API_URL);
    cargarProductos();
    formProducto.addEventListener('submit', guardarProducto);
    btnCancelar.addEventListener('click', limpiarFormulario);
});

// Función para cargar productos desde el backend
async function cargarProductos() {
    try {
        console.log('Cargando productos desde:', `${API_URL}/productos`);
        
        const response = await fetch(`${API_URL}/productos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('Productos cargados:', productos);
        mostrarProductos(productos);
        
    } catch (error) {
        console.error('Error detallado:', error);
        tbody.innerHTML = `<tr><td colspan="7">
            ❌ Error al cargar productos. 
            ¿Está el backend corriendo en http://localhost:3000?
            <br>
            <small>Error: ${error.message}</small>
        </td></tr>`;
    }
}

// Función para mostrar productos en la tabla
function mostrarProductos(productos) {
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">📦 No hay productos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(producto => {
        // Determinar estado según stock
        const estado = producto.cantidad <= producto.stockMinimo 
            ? '⚠️ Stock Bajo' 
            : '✅ Normal';
        
        return `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio}</td>
                <td>${producto.stockMinimo}</td>
                <td>${estado}</td>
                <td>
                    <button onclick="editarProducto('${producto.codigo}')">✏️ Editar</button>
                    <button onclick="eliminarProducto('${producto.codigo}')">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Función para guardar producto
async function guardarProducto(event) {
    event.preventDefault();
    
    const producto = {
        codigo: document.getElementById('codigo').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        cantidad: parseInt(document.getElementById('cantidad').value),
        precio: parseFloat(document.getElementById('precio').value),
        stockMinimo: parseInt(document.getElementById('stock-minimo').value)
    };
    
    // Validaciones básicas
    if (!producto.codigo || !producto.nombre) {
        alert('⚠️ Código y nombre son obligatorios');
        return;
    }
    
    try {
        console.log('Guardando producto:', producto);
        
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar');
        }
        
        const nuevoProducto = await response.json();
        console.log('Producto guardado:', nuevoProducto);
        
        alert('✅ Producto guardado exitosamente');
        limpiarFormulario();
        cargarProductos(); // Recargar la lista
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar: ' + error.message);
    }
}

// Función para eliminar producto
window.eliminarProducto = async function(codigo) {
    if (!confirm(`¿Estás seguro de eliminar el producto ${codigo}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/productos/${codigo}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar');
        }
        
        alert('✅ Producto eliminado exitosamente');
        cargarProductos(); // Recargar la lista
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar el producto');
    }
};

// Función para editar producto
window.editarProducto = async function(codigo) {
    try {
        // Primero obtener el producto actual
        const response = await fetch(`${API_URL}/productos/${codigo}`);
        const producto = await response.json();
        
        // Pedir nuevos valores
        const nuevoNombre = prompt('Nuevo nombre:', producto.nombre);
        if (!nuevoNombre) return;
        
        const nuevaCantidad = prompt('Nueva cantidad:', producto.cantidad);
        if (nuevaCantidad === null) return;
        
        const nuevoPrecio = prompt('Nuevo precio:', producto.precio);
        if (nuevoPrecio === null) return;
        
        const nuevoStockMinimo = prompt('Nuevo stock mínimo:', producto.stockMinimo);
        if (nuevoStockMinimo === null) return;
        
        const productoActualizado = {
            ...producto,
            nombre: nuevoNombre,
            cantidad: parseInt(nuevaCantidad),
            precio: parseFloat(nuevoPrecio),
            stockMinimo: parseInt(nuevoStockMinimo)
        };
        
        const updateResponse = await fetch(`${API_URL}/productos/${codigo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productoActualizado)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Error al actualizar');
        }
        
        alert('✅ Producto actualizado exitosamente');
        cargarProductos(); // Recargar la lista
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al editar el producto');
    }
};

// Función para limpiar formulario
function limpiarFormulario() {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('cantidad').value = '0';
    document.getElementById('precio').value = '0';
    document.getElementById('stock-minimo').value = '5';
}