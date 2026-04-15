// ==================== SISTEMA DE LOGIN ====================
const VALID_USERS = [
    { username: "admin", password: "admin123", displayName: "Administrador" },
    { username: "tornillo", password: "taller", displayName: "Jorge (Bodega)" },
    { username: "bodeguero", password: "inventario2026", displayName: "Carlos Almacén" }
];

const SESSION_KEY = "tornillo_feliz_session";
const STORAGE_PRODUCTS_KEY = "tornillo_productos_v2";

// ==================== HELPERS DE UNIDADES ====================
function getNombreUnidad(unidadKey) {
    const mapa = {
        'unidad': 'unidad', 'bulto': 'bulto', 'caja': 'caja',
        'kilo': 'kg', 'metro': 'm', 'litro': 'L',
        'docena': 'docena', 'pallet': 'pallet', 'galon': 'galón'
    };
    return mapa[unidadKey] || unidadKey;
}

function formatStockConUnidad(cantidad, unidadKey) {
    let unidadTexto = getNombreUnidad(unidadKey);
    if (cantidad !== 1) {
        if (unidadKey === 'bulto') unidadTexto = 'bultos';
        else if (unidadKey === 'caja') unidadTexto = 'cajas';
        else if (unidadKey === 'kilo') unidadTexto = 'kg';
        else if (unidadKey === 'metro') unidadTexto = 'metros';
        else if (unidadKey === 'litro') unidadTexto = 'litros';
        else if (unidadKey === 'docena') unidadTexto = 'docenas';
        else if (unidadKey === 'pallet') unidadTexto = 'pallets';
        else if (unidadKey === 'galon') unidadTexto = 'galones';
        else if (unidadKey === 'unidad') unidadTexto = 'unidades';
    } else {
        if (unidadKey === 'kilo') unidadTexto = 'kg';
        else if (unidadKey === 'metro') unidadTexto = 'metro';
        else if (unidadKey === 'litro') unidadTexto = 'litro';
    }
    return `${cantidad} ${unidadTexto}`;
}

function getEstadoVisual(producto) {
    let estadoBase = producto.estado;
    let advertencia = "";
    if (producto.stock < producto.stockMinimo) advertencia = " 🔻";
    if (producto.stock === 0) advertencia = " ⚠️ SIN STOCK";
    return estadoBase + advertencia;
}

function getEstadoClase(producto) {
    if (producto.stock === 0) return "critico";
    if (producto.stock < producto.stockMinimo) return "bajo";
    return "normal";
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== GESTIÓN DE PRODUCTOS ====================
let productos = [];

function guardarProductosEnStorage() {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(productos));
}

function loadProductosFromStorage() {
    const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (stored) {
        try {
            productos = JSON.parse(stored);
            if (!Array.isArray(productos)) productos = [];
            return;
        } catch(e) { productos = []; }
    }
    // Datos iniciales
    productos = [
        { codigo: "T00-001", nombre: "Destornillador", stock: 30, unidad: "unidad", precio: 8500, stockMinimo: 15, estado: "Normal" },
        { codigo: "CEM-101", nombre: "Cemento gris", stock: 42, unidad: "bulto", precio: 18900, stockMinimo: 20, estado: "Normal" },
        { codigo: "TOR-202", nombre: "Tornillos 1/2\"", stock: 8, unidad: "caja", precio: 45900, stockMinimo: 10, estado: "Lista Sede" },
        { codigo: "VAR-009", nombre: "Varilla corrugada", stock: 150, unidad: "metro", precio: 3200, stockMinimo: 80, estado: "Normal" },
        { codigo: "CAL-045", nombre: "Cal hidratada", stock: 12, unidad: "bulto", precio: 22500, stockMinimo: 5, estado: "Lista Sede" },
        { codigo: "CLA-332", nombre: "Clavos 2\"", stock: 3, unidad: "caja", precio: 12700, stockMinimo: 5, estado: "Crítico" }
    ];
    guardarProductosEnStorage();
}

function renderInventario() {
    const tbody = document.getElementById("tbodyInventario");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (productos.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7">📭 No hay productos registrados. Agrega uno nuevo.</td></tr>`;
        document.getElementById("contadorProductos").innerText = `Total: 0 productos`;
        return;
    }

    productos.forEach((prod, idx) => {
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(prod.precio);
        const stockConUnidad = formatStockConUnidad(prod.stock, prod.unidad);
        
        let unidadMin = getNombreUnidad(prod.unidad);
        if (prod.stockMinimo !== 1) {
            if (prod.unidad === 'bulto') unidadMin = 'bultos';
            else if (prod.unidad === 'caja') unidadMin = 'cajas';
            else if (prod.unidad === 'unidad') unidadMin = 'unidades';
            else if (prod.unidad === 'metro') unidadMin = 'metros';
            else if (prod.unidad === 'kilo') unidadMin = 'kg';
            else if (prod.unidad === 'litro') unidadMin = 'litros';
        }
        const stockMinMostrar = `${prod.stockMinimo} ${unidadMin}`;
        const estadoTexto = getEstadoVisual(prod);
        const claseEstado = getEstadoClase(prod);
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${escapeHtml(prod.codigo)}</strong></td>
            <td>${escapeHtml(prod.nombre)}</td>
            <td>${stockConUnidad} <span class="unidad-badge">${getNombreUnidad(prod.unidad)}</span></td>
            <td>${precioFormateado}</td>
            <td>${stockMinMostrar}</td>
            <td><span class="estado-badge ${claseEstado}">${escapeHtml(estadoTexto)}</span></td>
            <td class="acciones">
                <button class="btn-icon btn-borrar" data-index="${idx}">🗑️ Borrar</button>
                <button class="btn-icon btn-lista" data-index="${idx}">📋 Lista Sede</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById("contadorProductos").innerText = `Total: ${productos.length} productos`;

    // Eventos botones
    document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', () => borrarProducto(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('.btn-lista').forEach(btn => {
        btn.addEventListener('click', () => marcarListaSede(parseInt(btn.dataset.index)));
    });
}

function borrarProducto(index) {
    if (index >= 0 && index < productos.length) {
        productos.splice(index, 1);
        guardarProductosEnStorage();
        renderInventario();
    }
}

function marcarListaSede(index) {
    if (index >= 0 && index < productos.length) {
        productos[index].estado = "Lista Sede";
        guardarProductosEnStorage();
        renderInventario();
    }
}

function agregarProducto() {
    const codigo = document.getElementById("codigoInput").value.trim();
    const nombre = document.getElementById("nombreInput").value.trim();
    const unidad = document.getElementById("unidadSelect").value;
    let stock = parseInt(document.getElementById("stockInput").value, 10);
    let precio = parseFloat(document.getElementById("precioInput").value);
    let stockMinimo = parseInt(document.getElementById("stockMinInput").value, 10);
    const estado = document.getElementById("estadoSelect").value;

    if (!codigo) { alert("❌ Código obligatorio"); return; }
    if (!nombre) { alert("❌ Nombre obligatorio"); return; }
    if (isNaN(stock) || stock < 0) stock = 0;
    if (isNaN(precio) || precio < 0) precio = 0;
    if (isNaN(stockMinimo) || stockMinimo < 0) stockMinimo = 0;

    if (productos.some(p => p.codigo.toLowerCase() === codigo.toLowerCase())) {
        alert(`⚠️ Ya existe producto con código ${codigo}`);
        return;
    }

    productos.push({
        codigo, nombre, stock, unidad, precio: Math.round(precio), stockMinimo, estado
    });
    guardarProductosEnStorage();
    renderInventario();

    // Limpiar campos
    document.getElementById("codigoInput").value = "";
    document.getElementById("nombreInput").value = "";
    document.getElementById("stockInput").value = "0";
    document.getElementById("precioInput").value = "0";
    document.getElementById("stockMinInput").value = "10";
    document.getElementById("estadoSelect").value = "Normal";
}

// ==================== SISTEMA DE LOGIN ====================
function login(username, password) {
    const user = VALID_USERS.find(u => u.username === username && u.password === password);
    if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, username: user.username, displayName: user.displayName }));
        return true;
    }
    return false;
}

function checkSession() {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            if (session.loggedIn) return session;
        } catch(e) {}
    }
    return null;
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("inventarioContainer").style.display = "none";
    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("errorMsg").style.display = "none";
}

function showInventoryScreen(userSession) {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("inventarioContainer").style.display = "block";
    document.getElementById("currentUserSpan").innerText = userSession.displayName || userSession.username;
    loadProductosFromStorage();
    renderInventario();
}

// ==================== EVENTOS E INICIALIZACIÓN ====================
document.getElementById("loginBtn").addEventListener("click", () => {
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    const errorDiv = document.getElementById("errorMsg");
    if (login(username, password)) {
        errorDiv.style.display = "none";
        showInventoryScreen(checkSession());
    } else {
        errorDiv.innerText = "❌ Usuario o contraseña incorrectos. Intenta nuevamente.";
        errorDiv.style.display = "block";
    }
});

document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("agregarBtn").addEventListener("click", agregarProducto);

// Enter en login
const doLogin = () => document.getElementById("loginBtn").click();
document.getElementById("passwordInput").addEventListener("keypress", e => { if (e.key === "Enter") doLogin(); });
document.getElementById("usernameInput").addEventListener("keypress", e => { if (e.key === "Enter") doLogin(); });

// Inicializar
const activeSession = checkSession();
if (activeSession) {
    showInventoryScreen(activeSession);
} else {
    showLoginScreen();
}