// ShopVerse App Shell & Router
const router = {
  currentScreen: 'home',
  history: [],

  navigate(screen, params = {}) {
    this.history.push({ screen: this.currentScreen, params: {} });
    this.currentScreen = screen;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(`screen-${screen}`);
    if (targetScreen) {
      targetScreen.classList.add('active');
      targetScreen.scrollTop = 0;
    }
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.screen === screen);
    });
    // Load screen content
    switch (screen) {
      case 'home': homeModule.load(); break;
      case 'categories': categoriesModule.load(params); break;
      case 'search': searchModule.load(params); break;
      case 'product-detail': productDetailModule.load(params.productId); break;
      case 'cart': cartModule.loadScreen(); break;
      case 'wishlist': wishlistModule.loadScreen(); break;
      case 'checkout': checkoutModule.load(); break;
      case 'confirmation': confirmationModule.load(params.orderId); break;
      case 'orders': ordersModule.load(); break;
      case 'order-detail': ordersModule.loadDetail(params.orderId); break;
      case 'account': accountModule.load(params.tab || 'profile'); break;
      case 'settings': settingsModule.load(); break;
    }
  },

  back() {
    if (this.history.length > 0) {
      const prev = this.history.pop();
      this.navigate(prev.screen, prev.params);
    } else {
      this.navigate('home');
    }
  },
};

// App state
const appState = {
  user: null,
  cartCount: 0,
  wishlistIds: new Set(),

  updateCartBadge(count) {
    this.cartCount = count;
    const badges = document.querySelectorAll('#cart-badge, #topbarCartCount, .cart-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  updateWishlistBadge(count) {
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  async refreshCart() {
    try {
      const cart = await api.cart.get();
      this.updateCartBadge(cart.items.reduce((sum, i) => sum + i.quantity, 0));
      return cart;
    } catch (e) { return null; }
  },

  async refreshWishlist() {
    try {
      const w = await api.wishlist.get();
      this.wishlistIds = new Set(w.items.map(i => i.product.id));
      this.updateWishlistBadge(w.items.length);
      return w;
    } catch (e) { return null; }
  },
};

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check
  const token = localStorage.getItem('shopverse_token');
  const userData = localStorage.getItem('shopverse_user');
  if (!token || !userData) {
    window.location.href = 'index.html';
    return;
  }
  appState.user = JSON.parse(userData);
  themeManager.init();
  initShell();

  // Show onboarding if needed
  if (!appState.user.onboardingCompleted) {
    showOnboarding();
    return;
  }

  await Promise.all([appState.refreshCart(), appState.refreshWishlist()]);
  router.navigate('home');
});

function initShell() {
  // User display
  const avatarEl = document.getElementById('userAvatar');
  const avatarNameEl = document.getElementById('userAvatarName');
  if (avatarEl) { avatarEl.textContent = appState.user.name?.charAt(0).toUpperCase() || 'U'; avatarEl.setAttribute('role', 'button'); avatarEl.setAttribute('tabindex', '0'); avatarEl.setAttribute('aria-label', 'Open account menu'); }
  if (avatarNameEl) avatarNameEl.textContent = appState.user.name;

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const mobileToggle = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('sidebarOverlay');

  toggleBtn?.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
  mobileToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('mobile-open');
    overlay?.classList.toggle('visible');
  });
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('visible');
  });

  // Nav items
  document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
    item.addEventListener('click', () => {
      router.navigate(item.dataset.screen);
      // Close mobile sidebar
      sidebar?.classList.remove('mobile-open');
      overlay?.classList.remove('visible');
    });
  });

  // Search bar
  const searchInput = document.getElementById('globalSearch');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      router.navigate('search', { q: searchInput.value.trim() });
    }
  });

  // User avatar dropdown
  const avatarButton = document.getElementById('userAvatar');
  const toggleUserMenu = (e) => {
    e.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('visible');
  };
  avatarButton?.addEventListener('click', toggleUserMenu);
  avatarButton?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleUserMenu(e); } });
  document.addEventListener('click', () => {
    document.getElementById('userDropdown')?.classList.remove('visible');
  });

  // Dropdown items
  document.querySelector('#userDropdown a[href="#account"]')?.addEventListener('click', (e) => { e.preventDefault(); router.navigate('account', { tab: 'profile' }); });
  document.querySelector('#userDropdown a[href="#settings"]')?.addEventListener('click', (e) => { e.preventDefault(); router.navigate('settings'); });
  document.querySelectorAll('#userDropdown .admin-only').forEach(el => { if (appState.user.role === 'ADMIN') el.style.display = ''; });

  // Show admin option if admin
  if (appState.user.role === 'ADMIN') {
    document.getElementById('adminPanelLink')?.classList.remove('hidden');
  }

  // Logout
  document.querySelectorAll('.logout-btn, #logoutBtn, #dropdownLogoutBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      ui.confirm('Are you sure you want to log out?', () => {
        localStorage.removeItem('shopverse_token');
        localStorage.removeItem('shopverse_user');
        window.location.href = 'index.html';
      }, 'Log Out', false);
    });
  });

  // Cart icon in topbar
  document.getElementById('topbarCartBtn')?.addEventListener('click', () => router.navigate('cart'));
  document.getElementById('searchBtn')?.addEventListener('click', () => { if (searchInput?.value.trim()) router.navigate('search', { q: searchInput.value.trim() }); });
}

function showOnboarding() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-onboarding');
  if (!screen) return;
  screen.classList.add('active');
  onboardingModule.load();
}

window.router = router;
window.appState = appState;
window.showOnboarding = showOnboarding;
