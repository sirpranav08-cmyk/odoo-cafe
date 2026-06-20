// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const S = {
  currentUser: null,
  currentView: 'auth',
  posView: 'order',
  cart: [],
  currentTable: null,
  currentCustomer: null,
  payMethod: 'Cash',
  coupon: null,
  editingFormType: null,
  editingId: null,
  orderNum: 1,
  kdsSearch: '',

  users: [
    { id: 1, name: 'Admin User', email: 'admin@cafe.com', password: 'password', role: 'admin', status: 'active' },
    { id: 2, name: 'Eric', 'email': 'eric@cafe.com', password: 'emp123', role: 'employee', status: 'active' },
    { id: 3, name: 'Sara', email: 'sara@cafe.com', password: 'emp123', role: 'employee', status: 'active' },
  ],
  customers: [
    { id: 1, name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 9876543210' },
    { id: 2, name: 'Rahul Verma', email: 'rahul@gmail.com', phone: '+91 9812345678' },
  ],
  categories: [
    { id: 1, name: 'Beverages', color: '#4A90D9' },
    { id: 2, name: 'Chaat', color: '#E8A020' },
    { id: 3, name: 'Meals', color: '#D94F3D' },
    { id: 4, name: 'Dessert', color: '#9B59B6' },
  ],
  products: [
    { id: 1, name: 'Masala Tea', category: 1, price: 40, tax: 5, uom: 'piece', desc: 'Spiced Indian tea', emoji: '🍵' },
    { id: 2, name: 'Coffee', category: 1, price: 60, tax: 5, uom: 'piece', desc: 'Freshly brewed', emoji: '☕' },
    { id: 3, name: 'Lassi', category: 1, price: 80, tax: 5, uom: 'piece', desc: 'Sweet yogurt drink', emoji: '🥛' },
    { id: 4, name: 'Lemonade', category: 1, price: 50, tax: 5, uom: 'piece', desc: 'Fresh squeeze', emoji: '🍋' },
    { id: 5, name: 'Samosa', category: 2, price: 30, tax: 5, uom: 'piece', desc: 'Crispy fried pastry', emoji: '🥟' },
    { id: 6, name: 'Pav Bhaji', category: 2, price: 90, tax: 5, uom: 'piece', desc: 'Spiced mashed veggies', emoji: '🍛' },
    { id: 7, name: 'Bhel Puri', category: 2, price: 60, tax: 5, uom: 'piece', desc: 'Crispy puffed rice', emoji: '🍿' },
    { id: 8, name: 'Vada Pav', category: 2, price: 35, tax: 5, uom: 'piece', desc: 'Mumbai street burger', emoji: '🍔' },
    { id: 9, name: 'Chees Burger', category: 3, price: 150, tax: 5, uom: 'piece', desc: 'Grilled with cheese', emoji: '🍔' },
    { id: 10, name: 'Pizza', category: 3, price: 250, tax: 5, uom: 'piece', desc: 'Stone baked', emoji: '🍕' },
    { id: 11, name: 'Maggie', category: 3, price: 70, tax: 5, uom: 'piece', desc: 'Spiced noodles', emoji: '🍜' },
    { id: 12, name: 'Fries', category: 3, price: 120, tax: 5, uom: 'piece', desc: 'Golden crispy', emoji: '🍟' },
    { id: 13, name: 'Gulab Jamun', category: 4, price: 60, tax: 5, uom: 'piece', desc: 'Syrup soaked sweets', emoji: '🍮' },
    { id: 14, name: 'Ice Cream', category: 4, price: 80, tax: 5, uom: 'piece', desc: 'Vanilla scoop', emoji: '🍨' },
    { id: 15, name: 'Brownie', category: 4, price: 100, tax: 5, uom: 'piece', desc: 'Warm chocolate', emoji: '🍫' },
    { id: 16, name: 'Jalebi', category: 4, price: 50, tax: 5, uom: 'piece', desc: 'Crispy & sweet', emoji: '🍩' },
  ],
  paymentMethods: [
    { id: 1, name: 'Cash', type: 'cash', enabled: true, icon: '💵' },
    { id: 2, name: 'UPI', type: 'upi', enabled: true, icon: '📱', upiId: 'odoo_cafe@ybl' },
    { id: 3, name: 'Card / Digital', type: 'card', enabled: true, icon: '💳' },
  ],
  promotions: [
    { id: 1, name: 'SUMMER20', type: 'coupon', code: 'SUMMER20', discType: 'pct', discVal: 20, minAmt: 0, minQty: 0, active: true },
    { id: 2, name: 'FLAT50', type: 'coupon', code: 'FLAT50', discType: 'fixed', discVal: 50, minAmt: 0, minQty: 0, active: true },
    { id: 3, name: 'Happy Hour', type: 'auto_order', discType: 'pct', discVal: 15, minAmt: 300, active: true },
    { id: 4, name: 'Buy 3 Samosa', type: 'auto_product', productId: 5, discType: 'pct', discVal: 10, minQty: 3, active: true },
  ],
  floors: [
    { id: 1, num: 1, floor: 'Main Floor', seats: 4, active: true },
    { id: 2, num: 2, floor: 'Main Floor', seats: 2, active: true },
    { id: 3, num: 3, floor: 'Main Floor', seats: 6, active: true },
    { id: 4, num: 4, floor: 'Main Floor', seats: 4, active: true },
    { id: 5, num: 5, floor: 'Main Floor', seats: 2, active: true },
    { id: 6, num: 6, floor: 'Terrace', seats: 4, active: true },
    { id: 7, num: 7, floor: 'Terrace', seats: 4, active: true },
    { id: 8, num: 8, floor: 'Terrace', seats: 8, active: true },
  ],
  orders: [],
  kdsOrders: [],
};

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
  document.getElementById('view-' + v).classList.remove('hidden');
  S.currentView = v;
  if (v === 'backend') { renderBackend() }
  if (v === 'kds') { renderKDS() }
  if (v === 'session') { renderSession() }
}

function switchAuthTab(tab) {
  const tabs = ['login','signup','forgot'];
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  const tabIdx = { login: 0, signup: 1 }[tab];
  if (tabIdx !== undefined) document.querySelectorAll('.auth-tab')[tabIdx].classList.add('active');
  tabs.forEach(t => document.getElementById('auth-'+t)?.classList.toggle('hidden', t !== tab));
  // Reset verify prompt if switching away
  const vp = document.getElementById('verify-prompt');
  if (vp && tab !== 'login') vp.remove();
}

// ── API helpers ───────────────────────────────────────────────────────────────
const API = '/api';
function authHeader() {
  const token = localStorage.getItem('cafe_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}
async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  if (!email || !pass) { showToast('Email and password required'); return; }

  const btn = document.querySelector('#auth-login .btn-primary');
  btn.disabled = true; btn.textContent = 'Signing in…';

  const { ok, status, data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: pass }),
  });

  btn.disabled = false; btn.textContent = 'Open Session';

  if (!ok) {
    if (status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
      showVerificationPrompt(email);
    } else {
      showToast(data.message || 'Login failed');
    }
    return;
  }

  localStorage.setItem('cafe_token', data.token);
  S.currentUser = data.user;
  showView('session');
  showToast('Welcome back, ' + data.user.name + '!');
}

// ── Show "resend verification" prompt ─────────────────────────────────────────
function showVerificationPrompt(email) {
  const existing = document.getElementById('verify-prompt');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'verify-prompt';
  div.style.cssText = 'margin-top:12px;padding:12px;background:rgba(232,160,32,0.1);border:1px solid rgba(232,160,32,0.3);border-radius:8px;font-size:12px;color:#B0A080;text-align:center';
  div.innerHTML = `
    <div style="margin-bottom:6px">📧 Please verify your email before logging in.</div>
    <a onclick="resendVerification('${email}')" style="color:var(--amber);cursor:pointer;text-decoration:underline">Resend verification email</a>`;
  document.getElementById('auth-login').appendChild(div);
}

async function resendVerification(email) {
  const { ok, data } = await apiFetch('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  showToast(data.message || (ok ? 'Email sent!' : 'Error'));
}

// ── Forgot password ───────────────────────────────────────────────────────────
async function doForgotPassword() {
  const email = document.getElementById('f-email').value.trim();
  if (!email) { showToast('Enter your email'); return; }

  const btn = document.querySelector('#auth-forgot .btn-primary');
  btn.disabled = true; btn.textContent = 'Sending…';

  const { data } = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  btn.disabled = false; btn.textContent = 'Send Reset Link';
  document.getElementById('auth-forgot').innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:36px;margin-bottom:12px">📬</div>
      <div style="font-size:14px;color:var(--cream);margin-bottom:8px">${data.message || 'Check your email'}</div>
      <button class="btn-primary" style="margin-top:16px" onclick="switchAuthTab('login')">← Back to Login</button>
    </div>`;
}

// ── EmailJS config — replace with your actual IDs ────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_lu28vxe';
const EMAILJS_TEMPLATE_ID = 'template_1lobm3b';
const EMAILJS_PUBLIC_KEY  = 'dkLVASmAKFMrmX8pR';

// Init EmailJS
if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

// ── Signup — Step 1: create account & send OTP via EmailJS ───────────────────
async function doSignup() {
  const name  = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass  = document.getElementById('s-pass').value;
  if (!name || !email || !pass) { showToast('All fields required'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters'); return; }

  const btn = document.querySelector('#auth-signup .btn-primary');
  btn.disabled = true; btn.textContent = 'Creating account…';

  const { ok, data } = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password: pass }),
  });

  btn.disabled = false; btn.textContent = 'Create Account';

  if (!ok) { showToast(data.message || 'Signup failed'); return; }

  // Send OTP via EmailJS from the browser
  await sendOTPEmail(data.email, data.name, data.otp);

  // Show OTP input screen
  showOTPScreen(email, name);
}

// ── Send OTP email via EmailJS ────────────────────────────────────────────────
async function sendOTPEmail(email, name, otp) {
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email,
      to_name:  name,
      otp:      otp,
    });
  } catch (err) {
    console.error('EmailJS error:', err);
    showToast('Could not send OTP email — check EmailJS config');
  }
}

// ── Show OTP verification screen ──────────────────────────────────────────────
function showOTPScreen(email, name) {
  document.getElementById('auth-signup').innerHTML = `
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:36px;margin-bottom:10px">📧</div>
      <div style="font-size:15px;font-weight:600;color:var(--cream);margin-bottom:6px">Check your inbox!</div>
      <div style="font-size:12px;color:var(--cream-m);margin-bottom:20px">
        We sent a 6-digit OTP to<br><strong style="color:var(--amber)">${email}</strong><br>
        <span style="font-size:11px">Valid for 10 minutes</span>
      </div>
      <div class="form-group">
        <label>Enter OTP</label>
        <input type="text" id="otp-input" placeholder="000000" maxlength="6"
          style="text-align:center;font-size:24px;letter-spacing:8px;font-weight:700"
          oninput="this.value=this.value.replace(/[^0-9]/g,'')" />
      </div>
      <button class="btn-primary" onclick="doVerifyOTP('${email}')">Verify OTP</button>
      <div style="margin-top:12px;font-size:12px;color:var(--cream-m)">
        Didn't get it? <a onclick="doResendOTP('${email}','${name}')" style="color:var(--amber);cursor:pointer">Resend OTP</a>
      </div>
    </div>`;
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
async function doVerifyOTP(email) {
  const otp = document.getElementById('otp-input')?.value.trim();
  if (!otp || otp.length !== 6) { showToast('Enter the 6-digit OTP'); return; }

  const btn = document.querySelector('#auth-signup .btn-primary');
  btn.disabled = true; btn.textContent = 'Verifying…';

  const { ok, data } = await apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

  btn.disabled = false; btn.textContent = 'Verify OTP';

  if (!ok) { showToast(data.message || 'Invalid OTP'); return; }

  // Auto-login after verification
  localStorage.setItem('cafe_token', data.token);
  S.currentUser = data.user;
  showView('session');
  showToast('Welcome, ' + data.user.name + '! 🎉');
}

// ── Resend OTP ────────────────────────────────────────────────────────────────
async function doResendOTP(email, name) {
  const { ok, data } = await apiFetch('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!ok) { showToast(data.message || 'Error'); return; }
  await sendOTPEmail(data.email, data.name, data.otp);
  showToast('New OTP sent to ' + email);
}

// ── Logout ────────────────────────────────────────────────────────────────────
function doLogout() {
  localStorage.removeItem('cafe_token');
  S.currentUser = null; S.cart = []; S.currentTable = null;
  showView('auth');
}

// ── Auto-restore session on page load ────────────────────────────────────────
async function tryRestoreSession() {
  const token = localStorage.getItem('cafe_token');
  if (!token) return;
  const { ok, data } = await apiFetch('/auth/me');
  if (ok) {
    S.currentUser = data;
    showView('session');
  } else {
    localStorage.removeItem('cafe_token');
  }
}

function renderSession() {
  if (!S.currentUser) return;
  document.getElementById('sess-user-label').textContent = 'Logged in as ' + S.currentUser.name + ' (' + S.currentUser.role + ')';
  const paid = S.orders.filter(o => o.status === 'paid');
  document.getElementById('sess-orders').textContent = paid.length;
  const rev = paid.reduce((s, o) => s + o.total, 0);
  document.getElementById('sess-revenue').textContent = '₹' + rev;
  document.getElementById('sess-last-open').textContent = new Date().toLocaleDateString('en-IN');
  document.getElementById('sess-last-sale').textContent = paid.length ? '₹' + paid[paid.length - 1].total : '₹0';
  document.getElementById('be-avatar').textContent = (S.currentUser.name[0] || 'A').toUpperCase();
  document.getElementById('pos-emp-icon').textContent = (S.currentUser.name[0] || 'E').toUpperCase();
}

function openPOSSession() {
  showView('pos');
  setTimeout(() => showFloorPopup(), 200);
  renderPOS();
}

// ══════════════════════════════════════════
// BACKEND
// ══════════════════════════════════════════
function beSection(sec) {
  document.querySelectorAll('.be-section').forEach(s => s.classList.remove('active'));
  document.getElementById('be-' + sec).classList.add('active');
  document.querySelectorAll('.be-nav-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderBackend(sec);
}

function renderBackend(sec) {
  renderProductsTable(); renderCategoriesTable(); renderPaymentMethods(); renderPromosTable(); renderFloorsTable(); renderUsersTable(); renderReports();
}

// Products
function renderProductsTable() {
  const tbody = document.getElementById('tbl-products');
  tbody.innerHTML = S.products.map(p => {
    const cat = S.categories.find(c => c.id === p.category) || { name: '—', color: '#888' };
    return `<tr>
      <td><span style="font-size:16px;margin-right:6px">${p.emoji}</span>${p.name}</td>
      <td><span style="color:${cat.color};font-weight:600;font-size:12px">${cat.name}</span></td>
      <td style="color:var(--amber);font-weight:700">₹${p.price}</td>
      <td>${p.tax}%</td><td>${p.uom}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn" onclick="openProductForm(${p.id})">Edit</button>
        <button class="tbl-btn danger" onclick="deleteItem('products',${p.id})">Delete</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openProductForm(id = null) {
  S.editingFormType = 'product'; S.editingId = id;
  const p = id ? S.products.find(x => x.id === id) : { name: '', category: S.categories[0]?.id || 1, price: '', tax: 5, uom: 'piece', desc: '', emoji: '🍽' };
  document.getElementById('fp-title').textContent = id ? 'Edit Product' : 'New Product';
  document.getElementById('fp-body').innerHTML = `
    <div class="fp-group"><label>Emoji</label><input type="text" id="fp-emoji" value="${p.emoji}" maxlength="2"/></div>
    <div class="fp-group"><label>Name *</label><input type="text" id="fp-name" value="${p.name}" placeholder="e.g. Masala Tea"/></div>
    <div class="fp-group"><label>Category</label><select id="fp-cat">${S.categories.map(c => `<option value="${c.id}"${c.id === p.category ? ' selected' : ''}>${c.name}</option>`).join('')}<option value="new">+ Create new…</option></select></div>
    <div class="fp-group"><label>Price (₹) *</label><input type="number" id="fp-price" value="${p.price}" placeholder="0"/></div>
    <div class="fp-group"><label>Tax (%)</label><select id="fp-tax"><option value="0"${p.tax == 0 ? ' selected' : ''}>0%</option><option value="5"${p.tax == 5 ? ' selected' : ''}>5%</option><option value="12"${p.tax == 12 ? ' selected' : ''}>12%</option><option value="18"${p.tax == 18 ? ' selected' : ''}>18%</option><option value="28"${p.tax == 28 ? ' selected' : ''}>28%</option></select></div>
    <div class="fp-group"><label>Unit of Measure</label><select id="fp-uom"><option value="piece"${p.uom === 'piece' ? ' selected' : ''}>Per Piece</option><option value="kg"${p.uom === 'kg' ? ' selected' : ''}>Per Kg</option><option value="litre"${p.uom === 'litre' ? ' selected' : ''}>Per Litre</option></select></div>
    <div class="fp-group"><label>Description</label><textarea id="fp-desc" rows="2">${p.desc}</textarea></div>
  `;
  document.getElementById('fp-cat').onchange = function () { if (this.value === 'new') { const n = prompt('New category name:'); if (n) { const nc = { id: Date.now(), name: n, color: '#E8A020' }; S.categories.push(nc); this.innerHTML = S.categories.map(c => `<option value="${c.id}"${c.id === nc.id ? ' selected' : ''}>${c.name}</option>`).join('') + '<option value="new">+ Create new…</option>'; } } };
  openFormPanel();
}

// Categories
function renderCategoriesTable() {
  const tbody = document.getElementById('tbl-categories');
  tbody.innerHTML = S.categories.map(c => {
    const cnt = S.products.filter(p => p.category === c.id).length;
    return `<tr>
      <td>${c.name}</td>
      <td><span class="color-dot" style="background:${c.color}"></span> ${c.color}</td>
      <td>${cnt} products</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn" onclick="openCategoryForm(${c.id})">Edit</button>
        <button class="tbl-btn danger" onclick="deleteItem('categories',${c.id})">Delete</button>
      </div></td>
    </tr>`;
  }).join('');
}
function openCategoryForm(id = null) {
  S.editingFormType = 'category'; S.editingId = id;
  const c = id ? S.categories.find(x => x.id === id) : { name: '', color: '#E8A020' };
  const colors = ['#E8A020', '#D94F3D', '#5BA46A', '#4A90D9', '#9B59B6', '#E67E22', '#1ABC9C', '#E84393'];
  document.getElementById('fp-title').textContent = id ? 'Edit Category' : 'New Category';
  document.getElementById('fp-body').innerHTML = `
    <div class="fp-group"><label>Name *</label><input type="text" id="fp-name" value="${c.name}" placeholder="e.g. Beverages"/></div>
    <div class="fp-group"><label>Color</label>
      <div class="color-grid" id="color-grid">${colors.map(col => `<div class="color-swatch${col === c.color ? ' selected' : ''}" style="background:${col}" onclick="selectColor('${col}',this)"></div>`).join('')}</div>
      <input type="text" id="fp-color" value="${c.color}" placeholder="#E8A020" style="margin-top:8px"/>
    </div>`;
  openFormPanel();
}
function selectColor(col, el) { document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected')); el.classList.add('selected'); document.getElementById('fp-color').value = col; }

// Payment methods
function renderPaymentMethods() {
  const el = document.getElementById('payment-method-list');
  el.innerHTML = S.paymentMethods.map(pm => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:16px">
      <span style="font-size:24px">${pm.icon}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600">${pm.name}</div>
        ${pm.type === 'upi' ? `<div style="font-size:12px;color:var(--cream-m);margin-top:2px">UPI ID: <span style="color:var(--amber)">${pm.upiId || 'Not set'}</span></div>` : ''}
      </div>
      <label class="toggle"><input type="checkbox" ${pm.enabled ? 'checked' : ''} onchange="togglePM(${pm.id},this.checked)"/><span class="toggle-slider"></span></label>
      ${pm.type === 'upi' ? `<button class="tbl-btn" onclick="editUPI(${pm.id})">Edit UPI ID</button>` : ''}
    </div>`).join('');
}
function togglePM(id, val) { const pm = S.paymentMethods.find(p => p.id === id); if (pm) { pm.enabled = val; renderPaymentMethods(); showToast(pm.name + (val ? ' enabled' : ' disabled')); } }
function editUPI(id) { const pm = S.paymentMethods.find(p => p.id === id); if (!pm) return; const v = prompt('Enter UPI ID:', pm.upiId || ''); if (v !== null) { pm.upiId = v; renderPaymentMethods(); showToast('UPI ID updated'); } }

// Promotions
function renderPromosTable() {
  const tbody = document.getElementById('tbl-promos');
  tbody.innerHTML = S.promotions.map(p => {
    const cond = p.type === 'coupon' ? `Code: <strong>${p.code}</strong>` : p.type === 'auto_product' ? `Min Qty: ${p.minQty}` : `Min Order: ₹${p.minAmt}`;
    return `<tr>
      <td style="font-weight:600">${p.name}</td>
      <td style="font-size:11px;color:var(--cream-m)">${p.type === 'coupon' ? 'Coupon' : p.type === 'auto_product' ? 'Auto (Product)' : 'Auto (Order)'}</td>
      <td style="color:var(--green)">${p.discType === 'pct' ? p.discVal + '%' : '₹' + p.discVal} off</td>
      <td style="font-size:12px">${cond}</td>
      <td><span class="badge-status ${p.active ? 'badge-active' : 'badge-inactive'}">${p.active ? 'Active' : 'Inactive'}</span></td>
      <td><div class="tbl-actions">
        <button class="tbl-btn" onclick="openPromoForm(${p.id})">Edit</button>
        <button class="tbl-btn danger" onclick="deleteItem('promotions',${p.id})">Delete</button>
      </div></td>
    </tr>`;
  }).join('');
}
function openPromoForm(id = null) {
  S.editingFormType = 'promo'; S.editingId = id;
  const p = id ? S.promotions.find(x => x.id === id) : { name: '', type: 'coupon', code: '', discType: 'pct', discVal: 10, minAmt: 0, minQty: 1, active: true };
  document.getElementById('fp-title').textContent = id ? 'Edit Promotion' : 'New Promotion';
  document.getElementById('fp-body').innerHTML = `
    <div class="fp-group"><label>Name *</label><input type="text" id="fp-name" value="${p.name}"/></div>
    <div class="fp-group"><label>Type</label><select id="fp-type" onchange="renderPromoCondition()">
      <option value="coupon"${p.type === 'coupon' ? ' selected' : ''}>Coupon Code</option>
      <option value="auto_order"${p.type === 'auto_order' ? ' selected' : ''}>Automated – Order Amount</option>
      <option value="auto_product"${p.type === 'auto_product' ? ' selected' : ''}>Automated – Product Qty</option>
    </select></div>
    <div id="promo-cond-wrap"></div>
    <div class="fp-group"><label>Discount Type</label><select id="fp-disc-type"><option value="pct"${p.discType === 'pct' ? ' selected' : ''}>Percentage (%)</option><option value="fixed"${p.discType === 'fixed' ? ' selected' : ''}>Fixed Amount (₹)</option></select></div>
    <div class="fp-group"><label>Discount Value *</label><input type="number" id="fp-disc-val" value="${p.discVal}"/></div>
    <div class="fp-group"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="fp-active" ${p.active ? 'checked' : ''}/> Active</label></div>`;
  renderPromoCondition(p);
  openFormPanel();
}
function renderPromoCondition(p = null) {
  const type = document.getElementById('fp-type')?.value || 'coupon';
  const wrap = document.getElementById('promo-cond-wrap');
  if (!wrap) return;
  if (type === 'coupon') wrap.innerHTML = `<div class="fp-group"><label>Coupon Code</label><input type="text" id="fp-code" value="${p?.code || ''}"/></div>`;
  else if (type === 'auto_order') wrap.innerHTML = `<div class="fp-group"><label>Minimum Order Amount (₹)</label><input type="number" id="fp-minamt" value="${p?.minAmt || 0}"/></div>`;
  else wrap.innerHTML = `<div class="fp-group"><label>Minimum Quantity</label><input type="number" id="fp-minqty" value="${p?.minQty || 1}"/></div>`;
}

// Floors / tables
function renderFloorsTable() {
  const tbody = document.getElementById('tbl-floors');
  tbody.innerHTML = S.floors.map(t => `<tr>
    <td style="font-weight:700;color:var(--amber)">Table ${t.num}</td>
    <td>${t.floor}</td><td>${t.seats} seats</td>
    <td><span class="badge-status ${t.active ? 'badge-active' : 'badge-inactive'}">${t.active ? 'Active' : 'Inactive'}</span></td>
    <td><div class="tbl-actions">
      <button class="tbl-btn" onclick="openFloorForm(${t.id})">Edit</button>
      <button class="tbl-btn danger" onclick="deleteItem('floors',${t.id})">Delete</button>
    </div></td>
  </tr>`).join('');
}
function openFloorForm(id = null) {
  S.editingFormType = 'floor'; S.editingId = id;
  const t = id ? S.floors.find(x => x.id === id) : { num: '', floor: 'Main Floor', seats: 4, active: true };
  document.getElementById('fp-title').textContent = id ? 'Edit Table' : 'New Table';
  document.getElementById('fp-body').innerHTML = `
    <div class="fp-group"><label>Table Number *</label><input type="number" id="fp-num" value="${t.num}"/></div>
    <div class="fp-group"><label>Floor Name</label><input type="text" id="fp-floor" value="${t.floor}"/></div>
    <div class="fp-group"><label>Number of Seats</label><input type="number" id="fp-seats" value="${t.seats}"/></div>
    <div class="fp-group"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="fp-active" ${t.active ? 'checked' : ''}/> Active</label></div>`;
  openFormPanel();
}

// Users
function renderUsersTable() {
  const tbody = document.getElementById('tbl-users');
  tbody.innerHTML = S.users.map(u => `<tr>
    <td style="font-weight:500">${u.name}</td>
    <td style="color:var(--cream-m);font-size:12px">${u.email}</td>
    <td><span class="badge-role ${u.role === 'admin' ? 'badge-admin' : 'badge-emp'}">${u.role === 'admin' ? 'Admin' : 'Employee'}</span></td>
    <td><span class="badge-status ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}">${u.status}</span></td>
    <td><div class="tbl-actions">
      <button class="tbl-btn" onclick="openUserForm(${u.id})">Edit</button>
      <button class="tbl-btn" onclick="changePassword(${u.id})">Password</button>
      <button class="tbl-btn" onclick="archiveUser(${u.id})">${u.status === 'active' ? 'Archive' : 'Activate'}</button>
      <button class="tbl-btn danger" onclick="deleteItem('users',${u.id})">Delete</button>
    </div></td>
  </tr>`).join('');
}
function openUserForm(id = null) {
  S.editingFormType = 'user'; S.editingId = id;
  const u = id ? S.users.find(x => x.id === id) : { name: '', email: '', password: '', role: 'employee', status: 'active' };
  document.getElementById('fp-title').textContent = id ? 'Edit User' : 'New User';
  document.getElementById('fp-body').innerHTML = `
    <div class="fp-group"><label>Name *</label><input type="text" id="fp-name" value="${u.name}"/></div>
    <div class="fp-group"><label>Email *</label><input type="email" id="fp-email" value="${u.email}"/></div>
    ${id ? '' : '<div class="fp-group"><label>Password *</label><input type="password" id="fp-pass" value=""/></div>'}
    <div class="fp-group"><label>Role</label><select id="fp-role"><option value="admin"${u.role === 'admin' ? ' selected' : ''}>Admin / User</option><option value="employee"${u.role === 'employee' ? ' selected' : ''}>Employee / Cashier</option></select></div>
    <div class="fp-group"><label>Status</label><select id="fp-status"><option value="active"${u.status === 'active' ? ' selected' : ''}>Active</option><option value="inactive"${u.status === 'inactive' ? ' selected' : ''}>Inactive</option></select></div>`;
  openFormPanel();
}
function archiveUser(id) { const u = S.users.find(x => x.id === id); if (u) { u.status = u.status === 'active' ? 'inactive' : 'active'; renderUsersTable(); showToast(u.name + ' ' + (u.status === 'active' ? 'activated' : 'archived')); } }
function changePassword(id) { const u = S.users.find(x => x.id === id); if (!u) return; const p = prompt('New password for ' + u.name + ':'); if (p) { u.password = p; showToast('Password changed for ' + u.name); } }

// Form panel
function openFormPanel() { document.getElementById('form-panel').classList.add('open') }
function closeFormPanel() { document.getElementById('form-panel').classList.remove('open') }
function saveForm() {
  const type = S.editingFormType, id = S.editingId;
  if (type === 'product') {
    const d = { name: v('fp-name'), category: parseInt(v('fp-cat')), price: parseFloat(v('fp-price')) || 0, tax: parseInt(v('fp-tax')), uom: v('fp-uom'), desc: v('fp-desc'), emoji: v('fp-emoji') || '🍽' };
    if (!d.name || !d.price) { showToast('Name and price required'); return; }
    if (id) { Object.assign(S.products.find(x => x.id === id), d); } else { S.products.push({ id: Date.now(), ...d }); }
    renderProductsTable();
  } else if (type === 'category') {
    const d = { name: v('fp-name'), color: v('fp-color') || '#E8A020' };
    if (!d.name) { showToast('Name required'); return; }
    if (id) { Object.assign(S.categories.find(x => x.id === id), d); } else { S.categories.push({ id: Date.now(), ...d }); }
    renderCategoriesTable();
  } else if (type === 'promo') {
    const type2 = v('fp-type');
    const d = {
      name: v('fp-name'), type: type2, discType: v('fp-disc-type'), discVal: parseFloat(v('fp-disc-val')) || 0,
      code: type2 === 'coupon' ? v('fp-code') : '', minAmt: type2 === 'auto_order' ? parseFloat(v('fp-minamt')) || 0 : 0,
      minQty: type2 === 'auto_product' ? parseInt(v('fp-minqty')) || 1 : 0, active: document.getElementById('fp-active').checked
    };
    if (!d.name) { showToast('Name required'); return; }
    if (id) { Object.assign(S.promotions.find(x => x.id === id), d); } else { S.promotions.push({ id: Date.now(), ...d }); }
    renderPromosTable();
  } else if (type === 'floor') {
    const d = { num: parseInt(v('fp-num')) || 1, floor: v('fp-floor') || 'Main Floor', seats: parseInt(v('fp-seats')) || 2, active: document.getElementById('fp-active').checked };
    if (id) { Object.assign(S.floors.find(x => x.id === id), d); } else { S.floors.push({ id: Date.now(), ...d }); }
    renderFloorsTable();
  } else if (type === 'user') {
    const d = { name: v('fp-name'), email: v('fp-email'), role: v('fp-role'), status: v('fp-status') };
    if (!d.name || !d.email) { showToast('Name and email required'); return; }
    if (id) { Object.assign(S.users.find(x => x.id === id), d); }
    else { if (!v('fp-pass')) { showToast('Password required'); return; } S.users.push({ id: Date.now(), ...d, password: v('fp-pass') }); }
    renderUsersTable();
  }
  closeFormPanel(); showToast('Saved!');
}
function deleteItem(col, id) {
  if (!confirm('Delete this record?')) return;
  S[col] = S[col].filter(x => x.id !== id);
  renderBackend(); showToast('Deleted');
}
function v(id) { const el = document.getElementById(id); return el ? el.value : '' }

// Reports
function renderReports() {
  const paid = S.orders.filter(o => o.status === 'paid');
  document.getElementById('r-orders').textContent = paid.length;
  const rev = paid.reduce((s, o) => s + o.total, 0);
  document.getElementById('r-revenue').textContent = '₹' + rev;
  document.getElementById('r-avg').textContent = paid.length ? '₹' + Math.round(rev / paid.length) : '₹0';
  document.getElementById('r-custs').textContent = S.customers.length;

  // top products
  const pmap = {};
  paid.forEach(o => o.items.forEach(it => { pmap[it.name] = (pmap[it.name] || 0) + it.qty * it.price; }));
  const tops = Object.entries(pmap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxp = tops[0] ? tops[0][1] : 1;
  document.getElementById('r-top-products').innerHTML = tops.map(([n, v]) => `<div class="bar-row"><div class="bar-label">${n}</div><div class="bar-fill-wrap"><div class="bar-fill" style="width:${Math.round(v / maxp * 100)}%"></div></div><div class="bar-val">₹${v}</div></div>`).join('') || '<div style="color:var(--cream-m);font-size:12px">No data yet</div>';

  // top categories
  const cmap = {};
  paid.forEach(o => o.items.forEach(it => {
    const prod = S.products.find(p => p.name === it.name);
    const cat = prod ? S.categories.find(c => c.id === prod.category) : { name: 'Other' };
    const cn = cat?.name || 'Other';
    cmap[cn] = (cmap[cn] || 0) + it.qty * it.price;
  }));
  const topc = Object.entries(cmap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxc = topc[0] ? topc[0][1] : 1;
  document.getElementById('r-top-cats').innerHTML = topc.map(([n, v]) => `<div class="bar-row"><div class="bar-label">${n}</div><div class="bar-fill-wrap"><div class="bar-fill" style="width:${Math.round(v / maxc * 100)}%;background:var(--blue)"></div></div><div class="bar-val">₹${v}</div></div>`).join('') || '<div style="color:var(--cream-m);font-size:12px">No data yet</div>';

  document.getElementById('r-orders-table').innerHTML = paid.slice(-10).reverse().map(o => `<tr><td style="color:var(--amber)">#${String(o.num).padStart(5, '0')}</td><td>${o.customer || 'Guest'}</td><td style="font-weight:700">₹${o.total}</td><td><span class="status-pill status-${o.status}">${o.status}</span></td><td style="color:var(--cream-m);font-size:11px">${new Date(o.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td></tr>`).join('') || '<tr><td colspan="5" style="color:var(--cream-m);font-size:12px;padding:12px">No orders yet</td></tr>';
}
function setFilter(btn, f) { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderReports(); }

// ══════════════════════════════════════════
// POS TERMINAL
// ══════════════════════════════════════════
let posActiveCat = 'All';
function renderPOS() {
  renderPayMethods();
  renderCatBar();
  renderPosGrid();
  renderCart();
}

function renderCatBar() {
  const bar = document.getElementById('pos-cat-bar');
  const cats = ['All', ...S.categories.map(c => c.name)];
  bar.innerHTML = cats.map(c => `<button class="cat-btn${c === posActiveCat ? ' active' : ''}" onclick="setPosCategory('${c}')">${c}</button>`).join('');
}
function setPosCategory(c) { posActiveCat = c; renderCatBar(); renderPosGrid(); }

function renderPosGrid(q = '') {
  const grid = document.getElementById('pos-item-grid');
  const search = (document.getElementById('pos-search')?.value || '').toLowerCase();
  const items = S.products.filter(p => {
    const catName = S.categories.find(c => c.id === p.category)?.name || '';
    return (posActiveCat === 'All' || catName === posActiveCat) &&
      (p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search));
  });
  if (!items.length) { grid.innerHTML = '<div style="color:var(--cream-m);font-size:13px;padding:24px">No products found</div>'; return; }
  grid.innerHTML = items.map(p => {
    const cat = S.categories.find(c => c.id === p.category);
    return `<div class="item-card" onclick="addToCart(${p.id})">
      <div class="cat-color-bar" style="background:${cat?.color || 'transparent'}"></div>
      <span class="item-emoji">${p.emoji}</span>
      <div class="item-name">${p.name}</div>
      <div class="item-sub">${p.desc}</div>
      <div class="item-price">₹${p.price}</div>
    </div>`;
  }).join('');
}
function filterPosSearch() { renderPosGrid(); }

function renderPayMethods() {
  const enabled = S.paymentMethods.filter(p => p.enabled);
  document.getElementById('pay-methods-btns').innerHTML = enabled.map(pm => `<button class="pm-btn${S.payMethod === pm.name ? ' active' : ''}" onclick="selectPayMethod('${pm.name}')"><span class="pmi">${pm.icon}</span>${pm.name}</button>`).join('');
}
function selectPayMethod(name) { S.payMethod = name; renderPayMethods(); }

function switchPosView(v) {
  S.posView = v;
  document.getElementById('pos-order-view').style.display = v === 'order' ? 'flex' : 'none';
  document.getElementById('pos-orders-view').classList.toggle('active', v === 'orders');
  document.getElementById('pos-floor-view').classList.toggle('active', v === 'floor');
  ['order', 'orders', 'floor'].forEach(k => document.getElementById('nav-' + k)?.classList.toggle('active', k === v));
  if (v === 'orders') { renderOrdersList(); }
  if (v === 'floor') { renderFloorView(); }
}

// ── FLOOR POPUP ──
function showFloorPopup() {
  const grid = document.getElementById('popup-table-grid');
  const active = S.floors.filter(t => t.active);
  grid.innerHTML = active.map(t => {
    const hasOrder = S.orders.find(o => o.tableId === t.id && o.status === 'draft');
    return `<div class="fp-table${hasOrder ? ' occupied' : ''}" onclick="selectTable(${t.id})">
      <div class="fp-num">${t.num}</div>
      <div class="fp-seats">${t.seats} seats</div>
      ${hasOrder ? '<div style="font-size:10px;color:var(--amber);margin-top:4px">Active order</div>' : ''}
    </div>`;
  }).join('');
  document.getElementById('floor-popup').classList.remove('hidden');
}
function closeFloorPopup() { document.getElementById('floor-popup').classList.add('hidden'); }
function selectTable(id) {
  S.currentTable = S.floors.find(t => t.id === id);
  // load existing draft order if any
  const existing = S.orders.find(o => o.tableId === id && o.status === 'draft');
  if (existing) { S.cart = existing.items.map(i => ({ ...i })); S.coupon = existing.coupon || null; }
  else { S.cart = []; }
  S.currentCustomer = null;
  closeFloorPopup();
  document.getElementById('pos-table-badge').textContent = 'Table ' + S.currentTable.num;
  document.getElementById('cart-table-label').textContent = 'Table ' + S.currentTable.num + ' · ' + S.currentTable.seats + ' seats';
  renderCart();
  switchPosView('order');
  showToast('Table ' + S.currentTable.num + ' selected');
}

// ── FLOOR VIEW (nav) ──
function renderFloorView() {
  const floors = [...new Set(S.floors.map(t => t.floor))];
  document.getElementById('floor-tabs').innerHTML = floors.map((f, i) => `<button class="floor-tab${i === 0 ? ' active' : ''}" onclick="this.parentElement.querySelectorAll('.floor-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');renderFloorGrid('${f}')">${f}</button>`).join('');
  renderFloorGrid(floors[0]);
}
function renderFloorGrid(floor) {
  const tables = S.floors.filter(t => t.floor === floor && t.active);
  document.getElementById('floor-table-grid').innerHTML = tables.map(t => {
    const hasOrder = S.orders.find(o => o.tableId === t.id && o.status === 'draft');
    return `<div class="table-card${hasOrder ? ' occupied' : ''}" onclick="selectTable(${t.id});switchPosView('order')">
      <div class="table-num">${t.num}</div>
      <div class="table-seats">${t.seats} seats</div>
      <div class="table-status">${hasOrder ? '● Active' : '○ Free'}</div>
    </div>`;
  }).join('');
}

// ── CART ──
function addToCart(id) {
  const p = S.products.find(x => x.id === id);
  if (!p) return;
  const ex = S.cart.find(c => c.id === id);
  if (ex) ex.qty++;
  else S.cart.push({ id: p.id, name: p.name, emoji: p.emoji, price: p.price, tax: p.tax, qty: 1 });
  checkAutoPromos();
  renderCart();
  showToast(p.emoji + ' ' + p.name + ' added');
}
function changeQty(id, d) {
  const ex = S.cart.find(c => c.id === id);
  if (!ex) return;
  ex.qty = Math.max(0, ex.qty + d);
  if (ex.qty === 0) S.cart = S.cart.filter(c => c.id !== id);
  checkAutoPromos();
  renderCart();
}

function calcTotals() {
  let sub = S.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(sub * 0.05);
  let disc = 0, discLabel = '';
  if (S.coupon) {
    if (S.coupon.discType === 'pct') { disc = Math.round(sub * S.coupon.discVal / 100); discLabel = S.coupon.discVal + '% off'; }
    else { disc = Math.min(S.coupon.discVal, sub); discLabel = '₹' + S.coupon.discVal + ' off'; }
  }
  const total = Math.max(0, sub + tax - disc);
  return { sub, tax, disc, discLabel, total };
}

function checkAutoPromos() {
  const { sub } = calcTotals();
  // order-based
  const orderPromo = S.promotions.find(p => p.type === 'auto_order' && p.active && sub >= p.minAmt);
  // product-based
  let prodPromo = null;
  S.cart.forEach(item => {
    const pp = S.promotions.find(p => p.type === 'auto_product' && p.active && p.productId === item.id && item.qty >= p.minQty);
    if (pp) prodPromo = pp;
  });
  if (!S.coupon && (orderPromo || prodPromo)) {
    const ap = orderPromo || prodPromo;
    S.coupon = { ...ap, discLabel: ap.name };
    showToast('🎉 Auto promo applied: ' + ap.name);
  }
}

function renderCart() {
  const { sub, tax, disc, discLabel, total } = calcTotals();
  const cnt = S.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-cnt').textContent = cnt;

  const wrap = document.getElementById('cart-items-wrap');
  if (!S.cart.length) {
    wrap.innerHTML = '<div class="cart-empty"><div class="cart-empty-ico">🛒</div><div>Cart is empty</div></div>';
    document.getElementById('cart-totals-wrap').style.display = 'none';
    document.getElementById('btn-charge').disabled = true;
    document.getElementById('btn-charge').textContent = 'Charge ₹0';
    return;
  }
  wrap.innerHTML = S.cart.map(i => `<div class="cart-line">
    <div class="cl-emoji">${i.emoji}</div>
    <div class="cl-info">
      <div class="cl-name">${i.name}</div>
      <div class="cl-unit">₹${i.price} each</div>
    </div>
    <div class="qty-ctrl">
      <button class="qb" onclick="changeQty(${i.id},-1)">−</button>
      <span class="qn">${i.qty}</span>
      <button class="qb" onclick="changeQty(${i.id},1)">+</button>
    </div>
    <div class="cl-price">₹${i.price * i.qty}</div>
  </div>`).join('');

  document.getElementById('cart-totals-wrap').style.display = 'block';
  document.getElementById('t-sub').textContent = '₹' + sub;
  document.getElementById('t-tax').textContent = '₹' + tax;
  const dr = document.getElementById('t-disc-row');
  if (disc > 0) { dr.style.display = 'flex'; document.getElementById('t-disc-lbl').textContent = discLabel || 'Discount'; document.getElementById('t-disc-val').textContent = '-₹' + disc; }
  else dr.style.display = 'none';
  document.getElementById('t-total').textContent = '₹' + total;

  const btn = document.getElementById('btn-charge');
  btn.disabled = false;
  btn.textContent = 'Charge ₹' + total;
  document.getElementById('cart-cust-label').textContent = S.currentCustomer ? '👤 ' + S.currentCustomer.name : '';
}

// ── ORDERS LIST ──
function renderOrdersList(filter = '') {
  const list = document.getElementById('orders-list-container');
  let orders = [...S.orders].reverse();
  if (filter) orders = orders.filter(o => o.customer?.toLowerCase().includes(filter) || String(o.num).includes(filter) || new Date(o.date).toLocaleDateString().includes(filter));
  if (!orders.length) { list.innerHTML = '<div style="color:var(--cream-m);text-align:center;padding:24px;font-size:13px">No orders yet</div>'; return; }
  list.innerHTML = orders.map(o => `<div class="order-row" onclick="openOrderDetail(${o.id})">
    <div class="or-num">#${String(o.num).padStart(5, '0')}</div>
    <div class="or-info">
      <div class="or-cust">${o.customer || 'Guest'}</div>
      <div class="or-date">${new Date(o.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
    </div>
    <div class="or-amt">₹${o.total}</div>
    <span class="status-pill status-${o.status}">${o.status}</span>
  </div>`).join('');
}
function filterOrders(q) { renderOrdersList(q); }

function openOrderDetail(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) return;
  document.getElementById('od-title').textContent = 'Order #' + String(o.num).padStart(5, '0');
  document.getElementById('od-body').innerHTML = `
    <div class="od-meta">
      <div class="od-meta-item"><div class="lbl">Date</div><div class="val">${new Date(o.date).toLocaleDateString('en-IN')}</div></div>
      <div class="od-meta-item"><div class="lbl">Customer</div><div class="val">${o.customer || 'Guest'}</div></div>
      <div class="od-meta-item"><div class="lbl">Status</div><div class="val"><span class="status-pill status-${o.status}">${o.status}</span></div></div>
      <div class="od-meta-item"><div class="lbl">Payment</div><div class="val">${o.payMethod || '—'}</div></div>
    </div>
    <div class="od-items">${o.items.map(i => `<div class="od-item-row"><span>${i.qty}× ${i.name}</span><span style="color:var(--amber)">₹${i.price * i.qty}</span></div>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--cream-m);padding:4px 0"><span>Tax</span><span>₹${o.tax}</span></div>
    ${o.disc > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--green);padding:4px 0"><span>Discount</span><span>-₹${o.disc}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;padding:8px 0;border-top:1px solid var(--border);margin-top:6px"><span>Total</span><span style="color:var(--amber)">₹${o.total}</span></div>`;
  const footer = document.getElementById('od-footer');
  if (o.status === 'draft') {
    footer.innerHTML = `<button class="od-footer btn-del" onclick="deleteOrder(${o.id})">Delete</button><button class="od-footer btn-edit" onclick="editOrder(${o.id})">Edit Order</button>`;
  } else {
    footer.innerHTML = `<button class="od-footer btn-edit" onclick="closeOrderDetail()" style="background:var(--surface2);color:var(--cream)">Close</button>`;
  }
  document.getElementById('order-detail-wrap').classList.remove('hidden');
}
function closeOrderDetail() { document.getElementById('order-detail-wrap').classList.add('hidden'); }
function deleteOrder(id) { if (confirm('Delete this order?')) { S.orders = S.orders.filter(o => o.id !== id); closeOrderDetail(); renderOrdersList(); showToast('Order deleted'); } }
function editOrder(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) return;
  S.cart = o.items.map(i => ({ ...i }));
  S.coupon = o.coupon || null;
  S.currentCustomer = o.customerId ? S.customers.find(c => c.id === o.customerId) : null;
  S.orders = S.orders.filter(x => x.id !== id); // remove draft, will re-save
  closeOrderDetail();
  switchPosView('order');
  renderCart();
  showToast('Order loaded for editing');
}

// ── MODALS ──
function openDiscountModal() { document.getElementById('coupon-msg').textContent = ''; document.getElementById('coupon-code-input').value = ''; openOverlay('ov-discount'); }
function applyCoupon() {
  const code = document.getElementById('coupon-code-input').value.trim().toUpperCase();
  const promo = S.promotions.find(p => p.type === 'coupon' && p.active && p.code === code);
  const msg = document.getElementById('coupon-msg');
  if (promo) {
    S.coupon = promo;
    msg.style.color = 'var(--green)'; msg.textContent = '✓ Coupon applied: ' + promo.name;
    renderCart();
    setTimeout(() => closeOverlay('ov-discount'), 800);
  } else {
    msg.style.color = 'var(--red)'; msg.textContent = 'Invalid or expired coupon code';
  }
}

function openPaymentModal() {
  if (!S.cart.length) return;
  const { sub, tax, disc, discLabel, total } = calcTotals();
  const pm = S.paymentMethods.find(p => p.name === S.payMethod) || S.paymentMethods[0];
  document.getElementById('pay-modal-title').textContent = 'Pay via ' + pm.name;
  document.getElementById('pay-modal-sub').textContent = pm.name + ' payment for this order';
  document.getElementById('pay-modal-total').textContent = '₹' + total;
  document.getElementById('pay-summary').innerHTML =
    S.cart.map(i => `<div class="m-row"><strong>${i.qty}× ${i.name}</strong><span>₹${i.price * i.qty}</span></div>`).join('') +
    `<div class="m-row"><span>Tax (5%)</span><span>₹${tax}</span></div>` +
    (disc ? `<div class="m-row"><span>${discLabel}</span><span style="color:var(--green)">-₹${disc}</span></div>` : '');

  document.getElementById('cash-change-wrap').classList.toggle('hidden', pm.type !== 'cash');
  document.getElementById('upi-wrap').classList.toggle('hidden', pm.type !== 'upi');
  document.getElementById('card-wrap').classList.toggle('hidden', pm.type !== 'card');
  if (pm.type === 'upi') {
    document.getElementById('upi-qr-display').innerHTML = `<div style="text-align:center;padding:10px"><div style="font-size:30px;margin-bottom:6px">📱</div><div style="font-size:11px;color:#333">Scan to pay</div><div style="font-size:10px;color:#555;margin-top:4px">${pm.upiId || 'Set UPI ID in settings'}</div><div style="font-size:14px;font-weight:700;color:#111;margin-top:4px">₹${total}</div></div>`;
  }
  openOverlay('ov-payment');
}

function calcChange() {
  const { total } = calcTotals();
  const received = parseFloat(document.getElementById('cash-received').value) || 0;
  const change = Math.max(0, received - total);
  document.getElementById('change-due').textContent = '₹' + change;
}

function confirmPayment() {
  const { sub, tax, disc, discLabel, total } = calcTotals();
  const order = {
    id: Date.now(), num: S.orderNum++, tableId: S.currentTable?.id, customer: S.currentCustomer?.name || 'Guest',
    customerId: S.currentCustomer?.id, items: [...S.cart], sub, tax, disc, discLabel, total,
    payMethod: S.payMethod, coupon: S.coupon, status: 'paid', date: new Date().toISOString()
  };
  S.orders.push(order);
  closeOverlay('ov-payment');
  document.getElementById('success-sub').textContent = `₹${total} via ${S.payMethod} · Order #${String(order.num).padStart(5, '0')}`;
  openOverlay('ov-success');
}

function startNewOrder() {
  S.cart = []; S.coupon = null; S.currentCustomer = null;
  renderCart(); closeOverlay('ov-success');
  showFloorPopup();
}

function sendToKitchen() {
  if (!S.cart.length) { showToast('Cart is empty'); return; }
  const kdsOrder = {
    id: Date.now(), num: S.orderNum, tableId: S.currentTable?.id, tableNum: S.currentTable?.num || '?',
    items: S.cart.map(i => ({ ...i, done: false })), stage: 'tocook', time: Date.now()
  };
  S.kdsOrders.push(kdsOrder);
  // save as draft
  const existing = S.orders.find(o => o.tableId === S.currentTable?.id && o.status === 'draft');
  if (!existing) {
    S.orders.push({ id: Date.now() + 1, num: S.orderNum, tableId: S.currentTable?.id, customer: S.currentCustomer?.name || 'Guest', items: [...S.cart], sub: calcTotals().sub, tax: calcTotals().tax, disc: 0, total: calcTotals().total, status: 'draft', date: new Date().toISOString() });
  }
  showToast('🍳 Order sent to kitchen!');
  if (S.currentView === 'kds') renderKDS();
}

function openReceiptModal() {
  if (S.currentCustomer?.email) document.getElementById('receipt-email').value = S.currentCustomer.email;
  openOverlay('ov-receipt');
}
function sendReceipt() { const e = document.getElementById('receipt-email').value; if (!e) { showToast('Enter email'); return; } closeOverlay('ov-receipt'); showToast('Receipt sent to ' + e); }

// Customer modal
function openCustomerModal() { searchCustomers(''); document.getElementById('new-cust-name').value = ''; document.getElementById('new-cust-email').value = ''; document.getElementById('new-cust-phone').value = ''; document.getElementById('cust-search').value = ''; openOverlay('ov-customer'); }
function searchCustomers(q) {
  const res = document.getElementById('cust-results');
  const found = q ? S.customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())) : S.customers;
  res.innerHTML = found.map(c => `<div class="cust-result" onclick="selectCustomer(${c.id})"><strong>${c.name}</strong><div class="cr-email">${c.email} · ${c.phone}</div></div>`).join('');
}
function selectCustomer(id) { S.currentCustomer = S.customers.find(c => c.id === id); renderCart(); closeOverlay('ov-customer'); showToast('Customer: ' + S.currentCustomer.name); }
function createAndSelectCustomer() {
  const name = document.getElementById('new-cust-name').value.trim();
  const email = document.getElementById('new-cust-email').value.trim();
  const phone = document.getElementById('new-cust-phone').value.trim();
  if (!name) { showToast('Name required'); return; }
  const c = { id: Date.now(), name, email, phone };
  S.customers.push(c); S.currentCustomer = c;
  renderCart(); closeOverlay('ov-customer'); showToast('Customer created & selected');
}

// ══════════════════════════════════════════
// KDS
// ══════════════════════════════════════════
function renderKDS(filter = '') {
  ['tocook', 'preparing', 'completed'].forEach(stage => {
    const col = document.getElementById('kds-' + stage);
    const label = { 'tocook': '🔴 To Cook', 'preparing': '🟡 Preparing', 'completed': '🟢 Completed' }[stage];
    let orders = S.kdsOrders.filter(o => o.stage === stage);
    if (filter) orders = orders.filter(o => o.items.some(i => i.name.toLowerCase().includes(filter)));
    col.innerHTML = `<div class="kds-col-header">${label} <span style="color:var(--amber)">(${orders.length})</span></div>` +
      orders.map(o => `<div class="kds-ticket" onclick="advanceKDSOrder(${o.id})">
        <div class="kds-ticket-hd">
          <span class="kds-ticket-num">#${String(o.num).padStart(5, '0')} · Table ${o.tableNum}</span>
          <span class="kds-ticket-time">${timeSince(o.time)}</span>
        </div>
        ${o.items.map((it, idx) => `<div class="kds-item${it.done ? ' done' : ''}" onclick="event.stopPropagation();toggleKDSItem(${o.id},${idx})">
          <span class="kds-item-name">${it.emoji} ${it.name}</span>
          <span class="kds-item-qty">${it.qty}×</span>
        </div>`).join('')}
      </div>`).join('');
  });
}
function advanceKDSOrder(id) {
  const o = S.kdsOrders.find(x => x.id === id);
  if (!o) return;
  const stages = ['tocook', 'preparing', 'completed'];
  const idx = stages.indexOf(o.stage);
  if (idx < stages.length - 1) o.stage = stages[idx + 1];
  renderKDS();
}
function toggleKDSItem(orderId, itemIdx) {
  const o = S.kdsOrders.find(x => x.id === orderId);
  if (o) o.items[itemIdx].done = !o.items[itemIdx].done;
  renderKDS();
}
function filterKDS(q) { S.kdsSearch = q; renderKDS(q); }
function timeSince(ts) { const m = Math.floor((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m + 'm ago'; }

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
function openOverlay(id) { document.getElementById(id).classList.add('show'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('show'); }
function toggleHamburger() { document.getElementById('hamburger-menu').classList.toggle('open'); }
function closeHamburger() { document.getElementById('hamburger-menu').classList.remove('open'); }
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2000); }
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('show'); }));
document.addEventListener('click', e => { if (!e.target.closest('.hamburger') && !e.target.closest('#hamburger-menu')) closeHamburger(); });

// Restore session on page load (if JWT still valid)
document.addEventListener('DOMContentLoaded', tryRestoreSession);