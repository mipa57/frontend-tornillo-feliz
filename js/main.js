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
    console.log('📱 Frontend:', window.location.href);
    console.log('🔗 Backend:', API_URL);
    cargarProductos();
    
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProducto);
    }
    if (btnCancelar) {
        btnCancelar.addEventListener('click', limpiarFormulario);
    }
});

// ============================================
// CARGAR PRODUCTOS (CON MAPEO CORRECTO)
// ============================================
async function cargarProductos() {
    try {
        console.log('🔄 Cargando productos...');
        
        const response = await fetch(`${API_URL}/productos`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('📦 Datos recibidos del backend:', productos);
        
        // Mapear los campos del backend a lo que espera el frontend
        const productosMapeados = productos.map(prod => ({
            codigo: prod.codigo,
            nombre: prod.nombre,
            cantidad: prod.cantidad,
            precio: prod.precolventa || prod.precio || 0,  // ← Mapea precolventa a precio
            stockMinimo: prod.stockInimano || prod.stockMinimo || 0,  // ← Mapea stockInimano a stockMinimo
            bajostock: prod.bajostock || false
        }));
        
        console.log('📋 Productos mapeados:', productosMapeados);
        mostrarProductos(productosMapeados);
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarErrorEnTabla(`
            ❌ Error al cargar productos<br>
            Backend: ${API_URL}<br>
            Mensaje: ${error.message}
        `);
    }
}

// ============================================
// MOSTRAR PRODUCTOS EN TABLA
// ============================================
function mostrarProductos(productos) {
    if (!tbody) return;
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">📦 No hay productos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(producto => {
        // Calcular estado correctamente
        let estado = '';
        let estadoColor = '';
        
        if (producto.bajostock === true) {
            estado = '⚠️ Stock Bajo';
            estadoColor = 'orange';
        } else if (producto.cantidad <= producto.stockMinimo) {
            estado = '⚠️ Stock Bajo';
            estadoColor = 'orange';
        } else {
            estado = '✅ Normal';
            estadoColor = 'green';
        }
        
        // Formatear precio correctamente
        const precioFormateado = typeof producto.precio === 'number' 
            ? `$${producto.precio.toLocaleString('es-CL')}` 
            : `$${producto.precio || 0}`;
        
        return `
            <tr>
                <td><strong>${producto.codigo}</strong></td>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>${precioFormateado}</td>
                <td>${producto.stockMinimo}</td>
                <td style="color: ${estadoColor}; font-weight: bold;">${estado}</td>
                <td>
                    <button onclick="editarProducto('${producto.codigo}')" style="background: #17a2b8;">✏️ Editar</button>
                    <button onclick="eliminarProducto('${producto.codigo}')" style="background: #dc3545;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// GUARDAR PRODUCTO (CON CAMPOS CORRECTOS)
// ============================================
async function guardarProducto(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    const stockMinimo = parseInt(document.getElementById('stock-minimo').value);
    
    // Validaciones
    if (!codigo || !nombre) {
        alert('⚠️ Código y nombre son obligatorios');
        return;
    }
    
    if (isNaN(cantidad) || cantidad < 0) {
        alert('⚠️ Cantidad debe ser un número válido');
        return;
    }
    
    if (isNaN(precio) || precio < 0) {
        alert('⚠️ Precio debe ser un número válido');
        return;
    }
    
    // Crear objeto con los nombres de campos QUE ESPERA EL BACKEND
    const producto = {
        codigo: codigo,
        nombre: nombre,
        cantidad: cantidad,
        precolventa: precio,        // ← El backend espera "precolventa"
        stockInimano: stockMinimo,  // ← El backend espera "stockInimano"
        fechagRestro: new Date().toISOString(),  // ← Fecha actual
        bajostock: cantidad <= stockMinimo  // ← Calcular si está bajo stock
    };
    
    console.log('📤 Enviando al backend:', producto);
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Producto guardado:', resultado);
        
        alert('✅ Producto guardado exitosamente');
        limpiarFormulario();
        cargarProductos(); // Recargar lista
        
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('❌ Error al guardar: ' + error.message);
    }
}

// ============================================
// ELIMINAR PRODUCTO
// ============================================
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
        cargarProductos(); // Recargar lista
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
};

// ============================================
// EDITAR PRODUCTO
// ============================================
window.editarProducto = async function(codigo) {
    try {
        // Obtener producto actual
        const response = await fetch(`${API_URL}/productos/${codigo}`);
        const productoOriginal = await response.json();
        
        console.log('✏️ Editando producto:', productoOriginal);
        
        // Pedir nuevos valores
        const nuevoNombre = prompt('Nuevo nombre:', productoOriginal.nombre);
        if (nuevoNombre === null) return;
        
        const nuevaCantidad = prompt('Nueva cantidad:', productoOriginal.cantidad);
        if (nuevaCantidad === null) return;
        
        const nuevoPrecio = prompt('Nuevo precio:', productoOriginal.precolventa);
        if (nuevoPrecio === null) return;
        
        const nuevoStockMinimo = prompt('Nuevo stock mínimo:', productoOriginal.stockInimano);
        if (nuevoStockMinimo === null) return;
        
        // Crear objeto actualizado con los campos del backend
        const productoActualizado = {
            ...productoOriginal,
            nombre: nuevoNombre,
            cantidad: parseInt(nuevaCantidad),
            precolventa: parseFloat(nuevoPrecio),
            stockInimano: parseInt(nuevoStockMinimo),
            bajostock: parseInt(nuevaCantidad) <= parseInt(nuevoStockMinimo),
            fechagRestro: new Date().toISOString()
        };
        
        console.log('📤 Enviando actualización:', productoActualizado);
        
        const updateResponse = await fetch(`${API_URL}/productos/${codigo}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoActualizado)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Error al actualizar');
        }
        
        alert('✅ Producto actualizado exitosamente');
        cargarProductos(); // Recargar lista
        
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

// ============================================
// MOSTRAR ERROR
// ============================================
function mostrarErrorEnTabla(mensaje) {
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: red;">
            ${mensaje}
        </td></tr>`;
    }
}