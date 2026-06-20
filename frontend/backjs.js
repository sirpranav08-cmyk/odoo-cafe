// ════════════════════════════════════════════════════════════════════════
// ODOO CAFE — app.js
// Combined frontend logic for homepage.html (POS) + admin.html (Admin)
// Replaces: localStorage fake-DB (admin.html) + hardcoded S.* arrays (backjs.js)
//           + browser-side EmailJS OTP sending
// With:     real calls to your Express/MongoDB backend
//
// ⚠️ VERIFY THESE ENDPOINT NAMES/PAYLOADS AGAINST YOUR ACTUAL backend/routes/auth.js
//    Everything under API.auth.* is the one part built on assumption, since
//    auth.js wasn't available when this was written. If your real routes
//    differ, only the API.auth section needs editing — nothing else.
// ════════════════════════════════════════════════════════════════════════

const API_BASE = '/api';

// ── Token storage ──────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('cafe_token'); }
function setToken(t) { localStorage.setItem('cafe_token', t); }
function clearToken() { localStorage.removeItem('cafe_token'); }

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ════════════════════════════════════════════════════════════════════════
// AUTH  ⚠️ confirm paths against backend/routes/auth.js
// ════════════════════════════════════════════════════════════════════════
const Auth = {
  async signup(name, email, password) {
    // Expected: backend creates unverified user, emails OTP via nodemailer
    return api('/auth/signup', { method: 'POST', auth: false, body: { name, email, password } });
  },
  async verifyOtp(email, otp, purpose = 'verify') {
    // Expected: returns { token, user } on success
    return api('/auth/verify-otp', { method: 'POST', auth: false, body: { email, otp, purpose } });
  },
  async resendOtp(email, purpose = 'verify') {
    return api('/auth/resend-otp', { method: 'POST', auth: false, body: { email, purpose } });
  },
  async login(email, password) {
    // Expected: returns { token, user }
    return api('/auth/login', { method: 'POST', auth: false, body: { email, password } });
  },
  async forgotPassword(email) {
    return api('/auth/forgot-password', { method: 'POST', auth: false, body: { email } });
  },
  async resetPassword(email, otp, password) {
    return api('/auth/reset-password', { method: 'POST', auth: false, body: { email, otp, password } });
  },
  logout() {
    clearToken();
    localStorage.removeItem('cafe_user');
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('cafe_user') || 'null'); } catch { return null; }
  },
  setSession(token, user) {
    setToken(token);
    localStorage.setItem('cafe_user', JSON.stringify(user));
  },
};

// ════════════════════════════════════════════════════════════════════════
// DATA — matches your real backend/routes/data.js exactly
// ════════════════════════════════════════════════════════════════════════
const Data = {
  bootstrap:        () => api('/data/bootstrap'),
  seed:              () => api('/data/seed', { method: 'POST' }),

  getCategories:     () => api('/data/categories'),
  createCategory:    (body) => api('/data/categories', { method: 'POST', body }),
  updateCategory:    (id, body) => api(`/data/categories/${id}`, { method: 'PUT', body }),
  deleteCategory:    (id) => api(`/data/categories/${id}`, { method: 'DELETE' }),

  getProducts:       () => api('/data/products'),
  createProduct:     (body) => api('/data/products', { method: 'POST', body }),
  updateProduct:     (id, body) => api(`/data/products/${id}`, { method: 'PUT', body }),
  deleteProduct:     (id) => api(`/data/products/${id}`, { method: 'DELETE' }),

  getOrders:         () => api('/data/orders'),
  createOrder:       (body) => api('/data/orders', { method: 'POST', body }),
  updateOrder:       (id, body) => api(`/data/orders/${id}`, { method: 'PUT', body }),
  deleteOrder:       (id) => api(`/data/orders/${id}`, { method: 'DELETE' }),
};

// ════════════════════════════════════════════════════════════════════════
// APP STATE — populated from the backend instead of hardcoded
// ════════════════════════════════════════════════════════════════════════
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

  categories: [],
  products: [],
  orders: [],
  kdsOrders: [],
  // NOTE: paymentMethods, promotions, floors, customers are NOT yet covered
  // by backend/routes/data.js. Either add routes for them server-side, or
  // they'll need to stay local for now. Flagging rather than guessing.
  paymentMethods: [
    { id: 1, name: 'Cash', type: 'cash', enabled: true, icon: '💵' },
    { id: 2, name: 'UPI',  type: 'upi',  enabled: true, icon: '📱', upiId: 'odoo_cafe@ybl' },
    { id: 3, name: 'Card / Digital', type: 'card', enabled: true, icon: '💳' },
  ],
  promotions: [],
  floors: [],
};

// ── Load real data from MongoDB via bootstrap ───────────────────────────────
async function loadBootstrap() {
  try {
    const { categories, products, orders } = await Data.bootstrap();
    S.categories = categories || [];
    S.products = (products || []).map(p => ({
      ...p,
      id: p._id,                       // normalize Mongo _id -> id for existing UI code
      category: p.category?._id || p.category,
    }));
    S.orders = orders || [];
  } catch (err) {
    console.error('Bootstrap failed:', err);
    showToast('Could not load data from server');
  }
}

// ════════════════════════════════════════════════════════════════════════
// NAVIGATION (unchanged from original backjs.js)
// ════════════════════════════════════════════════════════════════════════
function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
  document.getElementById('view-' + v).classList.remove('hidden');
  S.currentView = v;
  if (v === 'backend') renderBackend();
  if (v === 'kds') renderKDS();
  if (v === 'session') renderSession();
}

function switchAuthTab(tab) {
  const tabs = ['login', 'signup', 'forgot'];
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  const tabIdx = { login: 0, signup: 1 }[tab];
  if (tabIdx !== undefined) document.querySelectorAll('.auth-tab')[tabIdx].classList.add('active');
  tabs.forEach(t => document.getElementById('auth-' + t)?.classList.toggle('hidden', t !== tab));
  const vp = document.getElementById('verify-prompt');
  if (vp && tab !== 'login') vp.remove();
}

// ════════════════════════════════════════════════════════════════════════
// AUTH FLOWS — now hitting the real backend instead of localStorage
// ════════════════════════════════════════════════════════════════════════
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  if (!email || !pass) { showToast('Email and password required'); return; }

  const btn = document.querySelector('#auth-login .btn-primary');
  btn.disabled = true; btn.textContent = 'Signing in…';

  try {
    const { token, user } = await Auth.login(email, pass);
    Auth.setSession(token, user);
    S.currentUser = user;
    await loadBootstrap();

    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      showView('session');
      showToast('Welcome back, ' + user.name + '!');
    }
  } catch (err) {
    if (/not verified/i.test(err.message)) {
      showLoginOTPPrompt(email, '');
    } else {
      showToast(err.message);
    }
  } finally {
    btn.disabled = false; btn.textContent = 'Open Session';
  }
}

function showLoginOTPPrompt(email, name) {
  const existing = document.getElementById('verify-prompt');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = 'verify-prompt';
  div.style.cssText = 'margin-top:12px;padding:12px;background:rgba(232,160,32,0.1);border:1px solid rgba(232,160,32,0.3);border-radius:8px;font-size:12px;color:#B0A080;text-align:center';
  div.innerHTML = `<div style="margin-bottom:6px">📧 Email not verified. Please verify to log in.</div>
    <a onclick="resendVerificationOTP('${email}','${name}')" style="color:var(--amber);cursor:pointer;text-decoration:underline">Resend OTP</a>`;
  document.getElementById('auth-login').appendChild(div);
}

async function resendVerificationOTP(email) {
  try {
    await Auth.resendOtp(email, 'verify');
    showToast('OTP sent to ' + email);
    showOTPVerifyScreen(email, 'verify');
  } catch (err) {
    showToast(err.message || 'Failed to resend OTP');
  }
}

async function doSignup() {
  const name  = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass  = document.getElementById('s-pass').value;
  if (!name || !email || !pass) { showToast('All fields required'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters'); return; }

  const btn = document.querySelector('#auth-signup .btn-primary');
  btn.disabled = true; btn.textContent = 'Sending OTP…';

  try {
    await Auth.signup(name, email, pass);
    showToast('OTP sent to ' + email);
    showOTPVerifyScreen(email, 'verify');
  } catch (err) {
    showToast(err.message || 'Signup failed');
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
}

function showOTPVerifyScreen(email, purpose) {
  const containerId = purpose === 'verify'
    ? (document.getElementById('auth-signup').classList.contains('hidden') ? 'auth-login' : 'auth-signup')
    : 'auth-forgot';

  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:36px;margin-bottom:8px">🔐</div>
      <div style="font-size:14px;font-weight:600;color:var(--cream)">Enter the 6-digit OTP</div>
      <div style="font-size:12px;color:var(--cream-m);margin-top:4px">Sent to <strong style="color:var(--amber)">${email}</strong></div>
    </div>
    <div class="form-group" style="text-align:center">
      <input type="text" id="otp-input" maxlength="6" placeholder="_ _ _ _ _ _"
        style="letter-spacing:8px;font-size:22px;font-weight:700;text-align:center;width:100%;padding:14px 0"
        oninput="this.value=this.value.replace(/[^0-9]/g,'')" />
    </div>
    <button class="btn-primary" onclick="verifyOTP('${email}','${purpose}')">Verify OTP</button>
    <div class="auth-footer" style="text-align:center;margin-top:10px">
      Didn't receive it? <a onclick="resendOTP('${email}','${purpose}')" style="cursor:pointer;color:var(--amber)">Resend OTP</a>
      &nbsp;·&nbsp; <a onclick="switchAuthTab('login')" style="cursor:pointer">Cancel</a>
    </div>`;
  el.dataset.otpEmail = email;
  el.dataset.otpPurpose = purpose;
}

async function verifyOTP(email, purpose) {
  const input = document.getElementById('otp-input')?.value.trim();
  if (!input || input.length < 6) { showToast('Enter the 6-digit OTP'); return; }

  try {
    if (purpose === 'verify') {
      const { token, user } = await Auth.verifyOtp(email, input, 'verify');
      Auth.setSession(token, user);
      S.currentUser = user;
      showToast('Email verified! Logging you in…');
      await loadBootstrap();
      showView('session');
    } else if (purpose === 'reset') {
      // OTP confirmed valid server-side; show new-password form
      const forgot = document.getElementById('auth-forgot');
      forgot.innerHTML = `
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:14px;font-weight:600;color:var(--cream)">Set New Password</div>
          <div style="font-size:12px;color:var(--cream-m);margin-top:4px">${email}</div>
        </div>
        <div class="form-group"><label>New Password</label><input type="password" id="rp-pass" placeholder="At least 6 characters"/></div>
        <div class="form-group"><label>Confirm Password</label><input type="password" id="rp-pass2" placeholder="Repeat password"/></div>
        <button class="btn-primary" onclick="doResetPassword('${email}','${input}')">Set Password</button>
        <div class="auth-footer"><a onclick="switchAuthTab('login')" style="cursor:pointer">← Back to Login</a></div>`;
    }
  } catch (err) {
    showToast(err.message || 'Incorrect or expired OTP');
  }
}

async function doResetPassword(email, otp) {
  const p1 = document.getElementById('rp-pass')?.value;
  const p2 = document.getElementById('rp-pass2')?.value;
  if (!p1 || p1.length < 6) { showToast('Password must be at least 6 characters'); return; }
  if (p1 !== p2) { showToast('Passwords do not match'); return; }

  try {
    await Auth.resetPassword(email, otp, p1);
    showToast('Password updated! Please log in.');
    switchAuthTab('login');
  } catch (err) {
    showToast(err.message || 'Reset failed');
  }
}

async function resendOTP(email, purpose) {
  try {
    await Auth.resendOtp(email, purpose);
    showToast('OTP resent to ' + email);
  } catch (err) {
    showToast(err.message || 'Failed to resend OTP');
  }
}

async function doForgotPassword() {
  const email = document.getElementById('f-email').value.trim();
  if (!email) { showToast('Enter your email'); return; }

  const btn = document.querySelector('#auth-forgot .btn-primary');
  btn.disabled = true; btn.textContent = 'Sending OTP…';

  try {
    await Auth.forgotPassword(email);
    showToast('OTP sent to ' + email);
    showOTPVerifyScreen(email, 'reset');
  } catch (err) {
    showToast(err.message || 'Failed to send OTP');
  } finally {
    btn.disabled = false; btn.textContent = 'Send OTP';
  }
}

function doLogout() {
  Auth.logout();
  S.currentUser = null; S.cart = []; S.currentTable = null;
  showView('auth');
}

async function tryRestoreSession() {
  const user = Auth.getUser();
  const token = getToken();
  if (!user || !token) return;
  S.currentUser = user;
  await loadBootstrap();
  if (user.role === 'admin' && !window.location.pathname.includes('admin.html')) {
    window.location.href = 'admin.html';
  } else if (user.role !== 'admin') {
    showView('session');
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

// ════════════════════════════════════════════════════════════════════════
// PRODUCTS / CATEGORIES — now backed by MongoDB via Data.*
// (Use these same patterns for any other CRUD section you build out)
// ════════════════════════════════════════════════════════════════════════
async function createProduct(payload) {
  const p = await Data.createProduct(payload);
  S.products.push({ ...p, id: p._id, category: p.category?._id || p.category });
  return p;
}
async function updateProductRemote(id, payload) {
  const p = await Data.updateProduct(id, payload);
  const idx = S.products.findIndex(x => x.id === id);
  if (idx > -1) S.products[idx] = { ...p, id: p._id, category: p.category?._id || p.category };
  return p;
}
async function deleteProductRemote(id) {
  await Data.deleteProduct(id);
  S.products = S.products.filter(x => x.id !== id);
}

async function createCategory(payload) {
  const c = await Data.createCategory(payload);
  S.categories.push({ ...c, id: c._id });
  return c;
}
async function updateCategoryRemote(id, payload) {
  const c = await Data.updateCategory(id, payload);
  const idx = S.categories.findIndex(x => x.id === id);
  if (idx > -1) S.categories[idx] = { ...c, id: c._id };
  return c;
}
async function deleteCategoryRemote(id) {
  await Data.deleteCategory(id);
  S.categories = S.categories.filter(x => x.id !== id);
}

// ════════════════════════════════════════════════════════════════════════
// TOAST / generic utils (unchanged)
// ════════════════════════════════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) { console.log('Toast:', msg); return; }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', tryRestoreSession);