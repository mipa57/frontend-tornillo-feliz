// js/api.js
// Configuración de la API
export const API_URL = 'http://localhost:3000/api';

// Función genérica para peticiones fetch
export async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error en la petición');
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error en ${endpoint}:`, error);
        throw error;
    }
}

// Funciones específicas para productos
export async function getProductos() {
    return await fetchAPI('/productos');
}

export async function getProducto(codigo) {
    return await fetchAPI(`/productos/${codigo}`);
}

export async function createProducto(producto) {
    return await fetchAPI('/productos', {
        method: 'POST',
        body: JSON.stringify(producto)
    });
}

export async function updateProducto(codigo, producto) {
    return await fetchAPI(`/productos/${codigo}`, {
        method: 'PUT',
        body: JSON.stringify(producto)
    });
}

export async function deleteProducto(codigo) {
    return await fetchAPI(`/productos/${codigo}`, {
        method: 'DELETE'
    });
}