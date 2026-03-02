const URL_BASE = 'http://localhost:3000/api';
let PageUsers = 1;
let PageProducts = 1;
let pageShop = 1;
let currentCatId = "";
let currentCatNombre = "";
const categoriesGrid = document.getElementById("categories-grid");
const productsGrid = document.getElementById("products-grid");
const viewAuth = document.getElementById("view-auth");
const viewCategories = document.getElementById("view-categories");
const viewProducts = document.getElementById("view-products");
const viewAdmin = document.getElementById("view-admin");
const userNameDisp = document.getElementById("userNameDisp");
const userRoleDisp = document.getElementById("userRoleDisp");
const currentCategoryTitle = document.getElementById("currentCategoryTitle");


function showAuth(type) {
    document.getElementById('loginForm').classList.toggle('active', type === 'login');
    document.getElementById('registerForm').classList.toggle('active', type === 'register');
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-register').classList.toggle('active', type === 'register');
}


document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
        nombre: regNombre.value,
        apellido: regApellido.value,
        username: regUsername.value,
        email: regEmail.value,
        password: regPassword.value
    };

    const res = await fetch(`${URL_BASE}/users/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        showToast("Registro exitoso. Por favor inicia sesion.");
        showAuth('login');
        e.target.reset();
    } else {
        showToast(result.message || "Error al registrar");
    }
});

document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
        identifier: logIdentifier.value,
        password: logPassword.value
    };

    const res = await fetch(`${URL_BASE}/users/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        localStorage.setItem('token', result.Token);
        localStorage.setItem('user', JSON.stringify(result.usuario));
        initApp();
        showToast(result.message || "Bienvenida/o");
    } else {
        showToast(result.message || "Login incorrecto");
    }
});


function initApp() {
    const userraw = localStorage.getItem('user');
    if (!userraw || userraw === "undefined") {
        viewAuth.style.setProperty = 'block';
        viewCategories.style.display = 'none';
        viewProducts.style.display = 'none';
        viewAdmin.style.display = 'none';
        return;
    }
    const user = JSON.parse(userraw);

    viewAuth.style.display = ('display', 'none', 'important');

    userNameDisp.textContent = user.nombre;
    userRoleDisp.textContent = "";

    checkAdminButton();

    if (user.role === 'admin') {
        showAdminView();
    } else {
        showCategoriesView();
    }
};

function showCategoriesView() {
    viewAuth.style.display = 'none';
    viewCategories.style.display = 'block';
    viewProducts.style.display = 'none';
    viewAdmin.style.display = 'none';
    checkAdminButton();
    loadCategories();
};

function showAdminView() {
    viewAuth.style.display = 'none';
    viewAdmin.style.display = 'block';
    viewCategories.style.display = 'none';
    viewProducts.style.display = 'none';
    loadAdminData();
    updateCategorySelect();
};


async function loadCategories() {
    try {
        const res = await fetch(`${URL_BASE}/category/viewCategorys`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
        });

        const categories = await res.json();
        categoriesGrid.innerHTML = "";

        categories.forEach(cat => {
        categoriesGrid.innerHTML += `
            <div class="category-item" onclick="openCategory('${cat._id}','${cat.nombre}')">
                <img src="${cat.imagenUrl || 'https://res.cloudinary.com/dawgtatxl/image/upload/v1772235626/default_a4kcs2.avif'}" alt="${cat.nombre}">
                <span class="category-link">${cat.nombre}</span>
            </div>
        `;
        });
    } catch (err) {
        console.error("Error cargando categorías", err);
    }
};

function openCategory(id, nombre) {
    loadProducts(id, nombre);
};

async function loadProducts(catId, nombre, page = 1) {
    currentCatId = catId;
    currentCatNombre = nombre;
    pageShop = page;
    const res = await fetch(`${URL_BASE}/products/viewProducts?categoria=${catId}`, {method:'GET'});
    const data = await res.json();

    currentCategoryTitle.textContent = nombre;
    productsGrid.innerHTML = "";
    const products = data.results || [];
    products.forEach(p => {
        const fotourl = p.imagenUrl || 'https://res.cloudinary.com/dawgtatxl/image/upload/v1772235626/default_a4kcs2.avif';
        
        productsGrid.innerHTML += `
        <div class="card">
            <img src="${fotourl}" alt="${p.nombre}">
            <div class="card-content">
                <h3>${p.nombre}</h3>
                <p class="price">$${p.precio.toFixed(2)}</p>
                <p class="description">${p.descripcion || 'Producto de alta calidad para tu gatito.'}</p>
                <p class="stock">Stock: ${p.stock}</p>
            </div>
            <div class="card-actions">
                <button class="btn-buy" onclick="alert('Próximamente: Carrito de compras')">Agregar al Carrito</button>
            </div>
        </div>
        `;
    });
    const infoSpan = document.getElementById("shop-page-info");
    if (infoSpan && data.info) {
        infoSpan.innerText = `Página ${data.info.paginaActual} de ${data.info.paginasTotales}`;
    }
    viewCategories.style.display = 'none';
    document.getElementById("view-products").style.display = 'block';
    window.scrollTo(0, 0);
};



async function updateCategorySelect() {
    const res = await fetch(`${URL_BASE}/category/viewCategorys`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const cats = await res.json();
    prodCategory.innerHTML =
        '<option value="">Seleccionar...</option>' +
        cats.map(c => `<option value="${c._id}">${c.nombre}</option>`).join('');
};

async function loadAdminData() {
    const catData = await fetch(`${URL_BASE}/category/viewCategorys`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json());

    document.getElementById("admin-list-categories").innerHTML =
        catData.map(c => {
        const fotoUrl = c.imagenUrl || 'https://res.cloudinary.com/dawgtatxl/image/upload/v1772235626/default_a4kcs2.avif';
        return `
        <div class="list-item">
            <img src="${fotoUrl}" width="50" style="border-radius:5px">
            <span>${c.nombre}</span>
            <div class="button-container">
            <button class="btn-edit" onclick="editCategory('${c._id}','${c.nombre}')">Editar</button>
            <button class="btn-delete" onclick="deleteCategory('${c._id}')">Eliminar</button>
            </div>
        </div>
        `}).join('');

    const prodData = await fetch(`${URL_BASE}/products/viewProducts?page=${PageProducts}&limit=10`, {method: 'GET'}).then(r => r.json());
    document.getElementById("page-products").innerText = `Página ${prodData.info.paginaActual} de ${prodData.info.paginasTotales}`;
    document.getElementById("admin-list-products").innerHTML =
        (prodData.results || []).map(p => {
        const fotoUrl = p.imagenUrl || 'https://res.cloudinary.com/dawgtatxl/image/upload/v1772235626/default_a4kcs2.avif';
        return `<div class="list-item">
            <img src="${fotoUrl}" width="50" style="border-radius:5px">
            <span>${p.nombre} ($${p.precio})</span>
            <div class="button-container">
            <button class="btn-edit" onclick="editProduct('${p._id}','${p.nombre}','${p.precio}', '${p.descripcion || ""}', '${p.stock}')">Editar</button>
            <button class="btn-delete" onclick="deleteProduct('${p._id}')">Eliminar</button>
            </div>
        </div>
        `}).join('');

    const usersData = await fetch(`${URL_BASE}/users/Users?page=${PageUsers}&limit=10`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json());
    console.log("Usuarios obtenidos:", usersData.results);
    document.getElementById("page-users").innerText = `Página ${usersData.info.paginaActual} de ${usersData.info.paginasTotales}`;
    document.getElementById("admin-list-users").innerHTML =
        (usersData.results || []).map(u => `
        <div class="list-item">
            <span>${u.username} (${u.role})</span>
            <div class="button-container"> 
            <button class="btn-edit" onclick="editUser('${u._id}', '${u.nombre}','${u.apellido}','${u.email}', '${u.username}', '${u.role}')">Editar</button>
            <button class="btn-delete" onclick="deleteUser('${u._id}')">Eliminar</button>
            </div>
        </div>
        `).join('');
};

document.getElementById('createCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', document.getElementById('catNombre').value);
    const fileInput = document.getElementById('catImagen'); 
    if (fileInput.files[0]) {
        formData.append('imagen', fileInput.files[0]); 
    }
    const res = await fetch(`${URL_BASE}/category/createCategory`, { 
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: formData
    });

    if (res.ok) {
        const result = await res.json();
        showToast(result.message || "Categoría creada");
        e.target.reset();
        loadAdminData();
    } else {
        showToast(res.message || "Error al crear categoría");
    }
});

async function deleteCategory(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    
    const res = await fetch(`${URL_BASE}/category/deleteCategory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if(res.ok){
        const result = await res.json();
        showToast(result.message || 'Categoria eliminada')
    } else {
        showToast(res.message || "Error al eliminar categoria");
    }
    loadAdminData();
};

async function editCategory(id, nombreActual) {
    document.getElementById('editModalCategory').style.display = 'block';
    document.getElementById('editCategoriaId').value = id;
    document.getElementById('editNombreCategory').value = nombreActual;
    const fileImagen = document.getElementById('editImagenCategory');
    if(fileImagen){
        fileImagen.value = "";
    }
};
document.getElementById('editCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editCategoriaId').value;
    const formData = new FormData();
    formData.append('nombre', document.getElementById('editNombreCategory').value);
    const fileInput = document.getElementById('editImagenCategory');
    if (fileInput.files[0]) {
        formData.append('imagen', fileInput.files[0]);
    }
    try {
        const res = await fetch(`${URL_BASE}/category/updateCategory/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: formData
        });
        if (res.ok) {
            const result = await res.json();
            showToast(result.message || "Categoría actualizada");
            cerrarModal();
            loadAdminData();
        } else {
            showToast(res.message || "Error al actualizar categoría");
        }
    } catch (error) {
        console.error("Error editando categoría:", error);
    }
});


document.getElementById('createProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', document.getElementById('prodNombreProduct').value);
    formData.append('precio', document.getElementById('prodPrecio').value);
    formData.append('descripcion', document.getElementById('prodDescripcion').value);
    formData.append('categoria', document.getElementById('prodCategory').value);
    formData.append('stock', document.getElementById('prodStock').value);

    const fileInput = document.getElementById('prodImagenProduct');
    if (fileInput.files[0]) {
        formData.append('imagen', fileInput.files[0]); 
    }

    const res =await fetch(`${URL_BASE}/products/createProduct`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: formData
    });
    if(res.ok){
        result= await res.json();
        showToast(result.message || "Producto agregado");
        e.target.reset();
        loadAdminData();
    } else {
        showToast(res.message || "Error al crear producto");
    }

});

async function editProduct(id, nombreActual, precioActual, descActual, stockActual) {
    document.getElementById('editModalProduct').style.display = 'block';
    if(!document.getElementById('editModalProduct')){
        showToast("Error al abrir el modal de edición");
        return;
    }
    document.getElementById('editProductoId').value = id;
    document.getElementById('editNombreProduct').value = nombreActual;
    document.getElementById('editPrecio').value = precioActual || 0;
    document.getElementById('editDescripcion').value = descActual;
    document.getElementById('editStock').value = stockActual || 0;
    const fileImagen = document.getElementById('editImagenProduct');
    if(fileImagen){
        fileImagen.value = "";
    }
};

document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProductoId').value;
    const formData = new FormData();
    formData.append('nombre', document.getElementById('editNombreProduct').value);
    formData.append('precio', document.getElementById('editPrecio').value);
    formData.append('descripcion', document.getElementById('editDescripcion').value);
    formData.append('stock', document.getElementById('editStock').value);
    const fileInput = document.getElementById('editImagenProduct');
    if (fileInput.files[0]) {
        formData.append('imagen', fileInput.files[0]);
    }
    await enviarEdicion(id, formData);
    document.getElementById('editModalProduct').style.display = 'none';
});

async function enviarEdicion(id, formData) {
    const res = await fetch(`${URL_BASE}/products/updateProduct/${id}`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });

    if (res.ok) {
        result = await res.json();
        showToast(result.message || "¡Producto actualizado!");
        loadAdminData(); 
    } else {
        showToast(res.message || "Error al actualizar producto");
    }
};

async function cerrarModal() {
    document.getElementById('editModalCategory').style.display = 'none';
    document.getElementById('editModalProduct').style.display = 'none';
    document.getElementById('editModalUser').style.display = 'none';
};

async function deleteProduct(id) {
    if (!confirm("¿Eliminar producto?")) return;
    const res = await fetch(`${URL_BASE}/products/deleteProduct/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (res.ok) {
        result = await res.json();
        showToast(result.message || "Producto eliminado");
        loadAdminData();
    } else {
        showToast(res.message || "No se pudo eliminar");
    }
};

// --- USUARIOS ---

document.getElementById('createUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('userNombre').value,
        apellido: document.getElementById('userApellido').value,
        email: document.getElementById('userEmail').value,
        username: document.getElementById('userUsername').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };
    const res = await fetch(`${URL_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        result = await res.json();
        showToast(result.message || "Usuario creado");
        e.target.reset();
        loadAdminData();
    } else {
        showToast(res.message || "Error al crear usuario");
    }
});

async function editUser(id, nombreActual, apellidoActual, emailActual, usernameActual, roleActual) {
    document.getElementById('editModalUser').style.display = 'block';
    document.getElementById('editUserId').value = id;
    document.getElementById('editNombreUser').value = nombreActual;
    document.getElementById('editApellido').value = apellidoActual;
    document.getElementById('editEmail').value = emailActual;
    document.getElementById('editUsername').value = usernameActual;
    document.getElementById('editRole').value = roleActual; 
};
document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const data = {
        nombre: document.getElementById('editNombreUser').value,
        apellido: document.getElementById('editApellido').value,
        email: document.getElementById('editEmail').value,
        username: document.getElementById('editUsername').value,
        role: document.getElementById('editRole').value
    }
    const res = await fetch(`${URL_BASE}/users/updateUser/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        result = await res.json();
        showToast(result.message || "Usuario actualizado");
        document.getElementById('editModalUser').style.display = 'none';
        loadAdminData();
    } else {
        showToast(res.message || "Error al actualizar usuario");
    }
});

async function deleteUser(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    const res = await fetch(`${URL_BASE}/users/deleteUser/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if(res.ok){
        result = await res.json();
        showToast(result.message || 'Usuario eliminado')
        loadAdminData();
    } else {
        showToast(res.message || "Error al eliminar usuario");
    }
};



function logout() {
    localStorage.clear();
    location.reload();
};

function showToast(msg) {
    const container = document.getElementById('contenedor-advertencia');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

const addCatForm = document.getElementById('addCategoryForm');
if (addCatForm) {
    addCatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { 
            nombre: document.getElementById('catNombre').value,
            descripcion: document.getElementById('catDescripcion').value 
        };
        
        const res = await fetch(`${URL_BASE}/category/addCategory`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showToast("Categoría creada con éxito");
            addCatForm.reset();
            loadAdminData(); 
        }
    });
};

const addProdForm = document.getElementById('addProductForm');
if (addProdForm) {
    addProdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('prodNombre').value,
            precio: document.getElementById('prodPrecio').value,
            descripcion: document.getElementById('prodDescripcion').value, 
            categoria: document.getElementById('prodCategory').value
        };

        const res = await fetch(`${URL_BASE}/products/addProduct`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showToast("Producto guardado");
            addProdForm.reset();
            loadAdminData();
        }
    });
};

function checkAdminButton() {
    const userraw = localStorage.getItem('user');
    const btnAdmin = document.getElementById('btn-regresar-admin');
    
    if (!btnAdmin) return;
    let isAdmin = false;
    if (userraw && userraw !== "undefined") {
        const user = JSON.parse(userraw);
        if (user.role === 'admin') {
            isAdmin = true;
        }
    }

    if (isAdmin) {
        btnAdmin.style.display = 'inline-block';
    } else {
        btnAdmin.style.display = 'none';
    }
};

function changePageAdmin(tipo, direccion) {
    if (tipo === 'users') {
        PageUsers += direccion;
        if (PageUsers < 1) PageUsers = 1;
    } else if (tipo === 'products') {
        PageProducts += direccion;
        if (PageProducts < 1) PageProducts = 1;
    }
    
    loadAdminData();
};

function changePageShop(direccion) {
    const nuevaPagina = pageShop + direccion;
    if (nuevaPagina >= 1) {
        loadProducts(currentCatId, currentCatNombre, nuevaPagina);
    }
};
initApp();

