// ShopVerse Auth Module
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  const token = localStorage.getItem('shopverse_token');
  const user = JSON.parse(localStorage.getItem('shopverse_user') || 'null');
  if (token && user) {
    redirectUser(user);
    return;
  }
  
  themeManager.init();
  initAuthUI();
});

function redirectUser(user) {
  if (user.role === 'ADMIN') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'app.html';
  }
}

function initAuthUI() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
      document.getElementById(`${target}Form`)?.classList.remove('hidden');
      clearErrors();
    });
  });
  
  // Forgot password link
  document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
    document.getElementById('forgotForm')?.classList.remove('hidden');
    clearErrors();
  });
  
  document.getElementById('backToLogin')?.addEventListener('click', () => {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
    document.getElementById('loginForm')?.classList.remove('hidden');
    clearErrors();
  });
  
  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!validateEmail(email, 'loginEmailError')) return;
    if (!password) { showError('loginPasswordError', 'Password is required'); return; }
    const btn = document.getElementById('loginBtn');
    ui.setLoading(btn, true, 'Signing in...');
    try {
      const response = await api.auth.login(email, password);
      saveAuth(response);
      ui.success('Welcome back!');
      setTimeout(() => redirectUser(response.user), 500);
    } catch (err) {
      showError('loginError', err.message || 'Invalid email or password');
    } finally {
      ui.setLoading(btn, false);
    }
  });
  
  // Signup form
  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    let valid = true;
    if (!name) { showError('signupNameError', 'Name is required'); valid = false; }
    if (!validateEmail(email, 'signupEmailError')) valid = false;
    if (password.length < 8) { showError('signupPasswordError', 'Password must be at least 8 characters'); valid = false; }
    if (password !== confirm) { showError('signupConfirmError', 'Passwords do not match'); valid = false; }
    if (!valid) return;
    const btn = document.getElementById('signupBtn');
    ui.setLoading(btn, true, 'Creating account...');
    try {
      const response = await api.auth.register(name, email, password);
      saveAuth(response);
      ui.success('Account created! Welcome to ShopVerse!');
      setTimeout(() => redirectUser(response.user), 500);
    } catch (err) {
      showError('signupError', err.message || 'Registration failed');
    } finally {
      ui.setLoading(btn, false);
    }
  });
  
  // Forgot password form
  document.getElementById('forgotForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const email = document.getElementById('forgotEmail').value.trim();
    if (!validateEmail(email, 'forgotEmailError')) return;
    const btn = document.getElementById('forgotBtn');
    ui.setLoading(btn, true, 'Sending...');
    try {
      await api.auth.forgotPassword(email);
      const successEl = document.getElementById('forgotSuccess');
      successEl.textContent = 'Reset link sent! Check your email (or server logs in development).';
      successEl.style.display = 'block';
      btn.textContent = 'Sent!';
    } catch (err) {
      showError('forgotError', err.message);
    } finally {
      ui.setLoading(btn, false);
    }
  });
  
  // Google Sign-In
  document.getElementById('googleSignInBtn')?.addEventListener('click', () => {
    window.location.href = 'http://localhost:8080/api/auth/google';
  });
  
  // Check for token in URL (Google OAuth callback redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const oauthToken = urlParams.get('token');
  const oauthError = urlParams.get('error');
  if (oauthToken) {
    // Fetch user details with token
    fetchUserAndRedirect(oauthToken);
  } else if (oauthError) {
    ui.error('Google sign-in failed: ' + oauthError);
  }
}

async function fetchUserAndRedirect(token) {
  localStorage.setItem('shopverse_token', token);
  try {
    const user = await api.user.me();
    localStorage.setItem('shopverse_user', JSON.stringify(user));
    redirectUser(user);
  } catch (e) {
    localStorage.removeItem('shopverse_token');
    ui.error('Authentication failed. Please try again.');
  }
}

function saveAuth(response) {
  localStorage.setItem('shopverse_token', response.token);
  localStorage.setItem('shopverse_user', JSON.stringify(response.user));
}

function validateEmail(email, errorId) {
  if (!email) { showError(errorId, 'Email is required'); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(errorId, 'Enter a valid email address'); return false; }
  return true;
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  const successEl = document.getElementById('forgotSuccess');
  if (successEl) successEl.style.display = 'none';
}

window.saveAuth = saveAuth;
