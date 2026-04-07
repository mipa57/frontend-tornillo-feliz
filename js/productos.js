import { getProductos, createProducto, updateProducto, deleteProducto } from './api.js';

// Estado local
let productos = [];

// Cargar todos los productos
export async function cargarProductos() {
    try {
        productos = await getProductos();
        return productos;
    } catch (error) {
        console.error('Error al cargar productos:', error);
        throw error;
    }
}

// Guardar nuevo producto
export async function guardarProducto(productoData) {
    // Validaciones
    if (!productoData.codigo || !productoData.nombre) {
        throw new Error('Código y nombre son requeridos');
    }
    
    if (productoData.cantidad < 0) {
        throw new Error('La cantidad no puede ser negativa');
    }
    
    if (productoData.precio < 0) {
        throw new Error('El precio no puede ser negativo');
    }
    
    const nuevoProducto = await createProducto(productoData);
    productos.push(nuevoProducto);
    return nuevoProducto;
}

// Actualizar producto existente
export async function actualizarProducto(codigoOriginal, productoData) {
    const productoActualizado = await updateProducto(codigoOriginal, productoData);
    
    // Actualizar en el array local
    const index = productos.findIndex(p => p.codigo === codigoOriginal);
    if (index !== -1) {
        productos[index] = productoActualizado;
    }
    
    return productoActualizado;
}

// Eliminar producto
export async function eliminarProducto(codigo) {
    await deleteProducto(codigo);
    
    // Eliminar del array local
    productos = productos.filter(p => p.codigo !== codigo);
    return true;
}

// Verificar stock bajo
export function verificarStockBajo(producto) {
    return producto.cantidad <= producto.stockMinimo;
}

// Buscar producto por código
export function buscarProducto(codigo) {
    return productos.find(p => p.codigo === codigo);
}