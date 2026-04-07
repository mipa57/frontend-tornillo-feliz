// ============================================
// CONFIGURACIÓN
// ============================================
const API_URL = 'http://localhost:8080/api';

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const formProducto = document.getElementById('form-producto');
const btnCancelar = document.getElementById('btn-cancelar');
const tbody = document.getElementById('tabla-productos');

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== EL TORNILLO FELIZ ===');
    cargarProductos();
    
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProducto);
    }
    if (btnCancelar) {
        btnCancelar.addEventListener('click', limpiarFormulario);
    }
});

// ============================================
// CARGAR PRODUCTOS
// ============================================
async function cargarProductos() {
    try {
        console.log('🔄 Cargando productos...');
        
        const response = await fetch(`${API_URL}/productos`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('📦 Datos del backend:', productos);
        
        mostrarProductos(productos);
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarErrorEnTabla(`Error: ${error.message}`);
    }
}

// ============================================
// MOSTRAR PRODUCTOS
// ============================================
function mostrarProductos(productos) {
    if (!tbody) return;
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">📦 No hay productos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(producto => {
        const precio = producto.precioVenta || 0;
        const stockMin = producto.stockMinimo || 0;
        const cantidad = producto.cantidad || 0;
        const bajoStock = producto.bajoStock || false;
        
        const estado = (bajoStock || cantidad <= stockMin) ? '⚠️ Stock Bajo' : '✅ Normal';
        const estadoColor = (bajoStock || cantidad <= stockMin) ? 'orange' : 'green';
        const precioFormateado = precio > 0 ? `$${precio.toLocaleString('es-CL')}` : '$0';
        
        return `
            <tr>
                <td><strong>${producto.codigo || 'N/A'}</strong></td>
                <td>${producto.nombre || 'N/A'}</td>
                <td>${cantidad}</td>
                <td>${precioFormateado}</td>
                <td>${stockMin}</td>
                <td style="color: ${estadoColor}; font-weight: bold;">${estado}</td>
                <td>
                    <button onclick="editarProducto('${producto.id}')" style="background: #17a2b8; color: white; border: none; padding: 5px 10px; margin: 0 3px; border-radius: 4px; cursor: pointer;">✏️ Editar</button>
                    <button onclick="eliminarProducto('${producto.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 0 3px; border-radius: 4px; cursor: pointer;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// GUARDAR PRODUCTO
// ============================================
async function guardarProducto(event) {
    event.preventDefault();
    
    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    const stockMinimo = parseInt(document.getElementById('stock-minimo').value);
    
    if (!codigo || !nombre) {
        alert('⚠️ Código y nombre son obligatorios');
        return;
    }
    
    const producto = {
        codigo: codigo,
        nombre: nombre,
        cantidad: cantidad,
        precioVenta: precio,
        stockMinimo: stockMinimo,
        fechaRegistro: new Date().toISOString(),
        bajoStock: cantidad <= stockMinimo
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        alert(`✅ Producto "${nombre}" guardado con éxito! Precio: $${precio}`);
        limpiarFormulario();
        cargarProductos();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al guardar: ' + error.message);
    }
}

// ============================================
// ELIMINAR PRODUCTO
// ============================================
window.eliminarProducto = async function(id) {
    if (!id) {
        alert('❌ ID del producto no encontrado');
        return;
    }
    
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        alert('✅ Producto eliminado exitosamente');
        cargarProductos();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
};

// ============================================
// EDITAR PRODUCTO (DELETE + POST)
// ============================================
window.editarProducto = async function(id) {
    if (!id) {
        alert('❌ ID del producto no encontrado');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        
        const producto = await response.json();
        
        const nuevoNombre = prompt('Nuevo nombre:', producto.nombre);
        if (nuevoNombre === null) return;
        
        const nuevaCantidad = prompt('Nueva cantidad:', producto.cantidad);
        if (nuevaCantidad === null) return;
        
        const nuevoPrecio = prompt('Nuevo precio:', producto.precioVenta);
        if (nuevoPrecio === null) return;
        
        const nuevoStock = prompt('Nuevo stock mínimo:', producto.stockMinimo);
        if (nuevoStock === null) return;
        
        const cantidadNum = parseInt(nuevaCantidad);
        const precioNum = parseFloat(nuevoPrecio);
        const stockNum = parseInt(nuevoStock);
        
        // Eliminar viejo
        await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
        
        // Crear nuevo
        const nuevoProducto = {
            codigo: producto.codigo,
            nombre: nuevoNombre,
            cantidad: cantidadNum,
            precioVenta: precioNum,
            stockMinimo: stockNum,
            fechaRegistro: new Date().toISOString(),
            bajoStock: cantidadNum <= stockNum
        };
        
        const postResponse = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        
        if (!postResponse.ok) throw new Error('Error al crear producto');
        
        alert('✅ Producto actualizado exitosamente');
        cargarProductos();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al editar: ' + error.message);
    }
};

// ============================================
// LIMPIAR FORMULARIO
// ============================================
function limpiarFormulario() {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('cantidad').value = '0';
    document.getElementById('precio').value = '0';
    document.getElementById('stock-minimo').value = '5';
}

function mostrarErrorEnTabla(mensaje) {
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: red;">${mensaje}</td></tr>`;
    }
}