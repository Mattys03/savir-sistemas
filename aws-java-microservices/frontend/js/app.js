/* ===== Savir Sistemas — API + App Logic ===== */

const AUTH_URL = window.AUTH_URL || '';
const CATALOG_URL = window.CATALOG_URL || '';

// Estado global
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ===== API Helper =====
async function api(baseUrl, path, options = {}) {
  const url = baseUrl + path;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (currentUser) headers['user-id'] = currentUser.id;
  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro de conexão' }));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    if (e.message.includes('Failed to fetch')) throw new Error('Servidor indisponível. Verifique se os microserviços estão rodando.');
    throw e;
  }
}

// ===== Auth =====
function isLoggedIn() { return currentUser !== null; }
function isAdmin() { return currentUser?.profile === 'Administrador'; }
function requireAuth() { if (!isLoggedIn()) window.location.href = 'index.html'; }
function logout() { currentUser = null; localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }

async function login(loginStr, password) {
  const data = await api(AUTH_URL, '/api/auth/login', {
    method: 'POST', body: JSON.stringify({ login: loginStr, password })
  });
  if (data.success) {
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  }
  return data;
}

// ===== Users =====
async function getUsers() { return api(AUTH_URL, '/api/users'); }
async function getUserById(id) { return api(AUTH_URL, '/api/users/' + id); }
async function createUser(user) { return api(AUTH_URL, '/api/users', { method: 'POST', body: JSON.stringify(user) }); }
async function updateUser(id, user) { return api(AUTH_URL, '/api/users/' + id, { method: 'PUT', body: JSON.stringify(user) }); }
async function deleteUser(id) { return api(AUTH_URL, '/api/users/' + id, { method: 'DELETE' }); }

// ===== Clients =====
async function getClients() { return api(CATALOG_URL, '/api/clients'); }
async function getClientById(id) { return api(CATALOG_URL, '/api/clients/' + id); }
async function createClient(client) { return api(CATALOG_URL, '/api/clients', { method: 'POST', body: JSON.stringify(client) }); }
async function updateClient(id, client) { return api(CATALOG_URL, '/api/clients/' + id, { method: 'PUT', body: JSON.stringify(client) }); }
async function deleteClient(id) { return api(CATALOG_URL, '/api/clients/' + id, { method: 'DELETE' }); }

// ===== Products =====
async function getProducts() { return api(CATALOG_URL, '/api/products'); }
async function getProductById(id) { return api(CATALOG_URL, '/api/products/' + id); }
async function createProduct(product) { return api(CATALOG_URL, '/api/products', { method: 'POST', body: JSON.stringify(product) }); }
async function updateProduct(id, product) { return api(CATALOG_URL, '/api/products/' + id, { method: 'PUT', body: JSON.stringify(product) }); }
async function deleteProduct(id) { return api(CATALOG_URL, '/api/products/' + id, { method: 'DELETE' }); }

// ===== Header =====
function renderHeader() {
  const h = document.getElementById('app-header');
  if (!h || !isLoggedIn()) return;
  h.innerHTML = `
    <h1>Savir Sistemas</h1>
    <nav>
      <a href="dashboard.html">Início</a>
      <div class="dropdown">
        <a href="#" onclick="toggleDropdown(event)">Cadastros ▾</a>
        <div class="dropdown-menu" id="dropdown-menu">
          <a href="users.html">Usuários</a>
          <a href="clients.html">Clientes</a>
          <a href="products.html">Produtos</a>
        </div>
      </div>
      <span class="user-info">Olá, ${currentUser.name}!</span>
      <button class="btn-logout" onclick="logout()">Sair</button>
    </nav>`;
}

function toggleDropdown(e) {
  e.preventDefault();
  document.getElementById('dropdown-menu').classList.toggle('show');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    const d = document.getElementById('dropdown-menu');
    if (d) d.classList.remove('show');
  }
});
