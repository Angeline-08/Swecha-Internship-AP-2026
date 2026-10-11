// ShopVerse UI Utilities
const ui = {
  // Toast system
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast__content"><div class="toast__title">${message}</div></div>
      <button class="toast__close" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, duration);
  },
  success: (msg) => ui.toast(msg, 'success'),
  error: (msg) => ui.toast(msg, 'error'),
  warning: (msg) => ui.toast(msg, 'warning'),
  info: (msg) => ui.toast(msg, 'info'),

  // Modal system
  createModal(title, bodyHtml, footerHtml = '') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${title}</h3>
          <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal__body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal__footer">${footerHtml}</div>` : ''}
      </div>
    `;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    return overlay;
  },
  
  confirm(message, onConfirm, confirmText = 'Confirm', danger = false) {
    const overlay = ui.createModal(
      'Confirm Action',
      `<p style="color:var(--color-text-secondary);">${message}</p>`,
      `<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
       <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirmBtn">${confirmText}</button>`
    );
    overlay.querySelector('#confirmBtn').onclick = () => { overlay.remove(); onConfirm(); };
    return overlay;
  },
  
  closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.remove()); },

  // Button loading state
  setLoading(btn, loading, loadingText = 'Loading...') {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin-right:8px;"></span>${loadingText}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    }
  },

  // Skeleton loaders
  productCardSkeleton() {
    return `
      <div class="product-card" style="pointer-events:none;">
        <div class="product-card__image-wrapper"><div class="skeleton skeleton-image"></div></div>
        <div class="product-card__body">
          <div class="skeleton skeleton-text" style="width:40%;"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width:60%;"></div>
          <div class="skeleton skeleton-text" style="width:50%;margin-top:16px;"></div>
          <div class="skeleton" style="height:36px;margin-top:8px;"></div>
        </div>
      </div>
    `;
  },

  productGridSkeletons(count = 8, gridClass = 'products-grid') {
    return `<div class="${gridClass}">${Array(count).fill(ui.productCardSkeleton()).join('')}</div>`;
  },

  // Empty states
  emptyState(icon, title, subtitle, actionHtml = '') {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">${icon}</div>
        <div class="empty-state__title">${title}</div>
        <div class="empty-state__subtitle">${subtitle}</div>
        ${actionHtml}
      </div>
    `;
  },

  // Price formatter (INR)
  formatPrice(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  },

  // Date formatter
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Star rating HTML
  stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '<span class="stars">';
    for (let i = 0; i < 5; i++) {
      if (i < full) html += '<span class="star filled">★</span>';
      else if (i === full && half) html += '<span class="star filled" style="opacity:0.6;">★</span>';
      else html += '<span class="star">★</span>';
    }
    html += '</span>';
    return html;
  },

  // Status badge
  statusBadge(status) {
    const colors = {
      PROCESSING: 'warning', PAID: 'success', SHIPPED: 'info', OUT_FOR_DELIVERY: 'info',
      DELIVERED: 'success', CANCELLED: 'error', PENDING: 'warning', FAILED: 'error', REFUNDED: 'info'
    };
    const labels = {
      PROCESSING: 'Processing', PAID: 'Paid', SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered', CANCELLED: 'Cancelled', PENDING: 'Pending', FAILED: 'Failed', REFUNDED: 'Refunded'
    };
    const color = colors[status] || 'info';
    return `<span class="badge badge-${color}">${labels[status] || status}</span>`;
  },

  // Product card HTML
  productCard(product, wishlistIds = new Set()) {
    const inWishlist = wishlistIds.has(product.id);
    const discounted = product.discountedPrice || product.price;
    const hasDiscount = product.discountPercent > 0;
    const inStock = product.stock > 0;
    return `
      <div class="product-card" data-product-id="${product.id}" onclick="router.navigate('product-detail', {productId: ${product.id}})">
        <div class="product-card__image-wrapper">
          <img class="product-card__image" src="${product.imageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'">
          <button class="product-card__wishlist-btn ${inWishlist ? 'active' : ''}" onclick="event.stopPropagation(); wishlistModule.toggle(${product.id}, this)" title="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
            ${inWishlist ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="product-card__body">
          ${product.brand ? `<div class="product-card__brand">${product.brand}</div>` : ''}
          <div class="product-card__name">${product.name}</div>
          <div class="product-card__rating">
            ${ui.stars(product.rating)}
            <span class="product-card__review-count">(${product.reviewCount})</span>
          </div>
          <div class="product-card__price-row">
            <span class="product-card__price">${ui.formatPrice(discounted)}</span>
            ${hasDiscount ? `<span class="product-card__original-price">${ui.formatPrice(product.price)}</span><span class="product-card__discount">${product.discountPercent}% off</span>` : ''}
          </div>
          <div class="product-card__footer">
            ${inStock
              ? `<button class="btn btn-primary btn-sm product-card__add-btn" onclick="event.stopPropagation(); cartModule.addToCart(${product.id}, 1, this)">Add to Cart</button>`
              : `<div class="product-card__out-of-stock">Out of Stock</div>`
            }
          </div>
        </div>
      </div>
    `;
  },

  // Page title updater
  setPageTitle(title) {
    const el = document.getElementById('pageTitle');
    if (el) el.textContent = title;
  },
};

// Theme management
const themeManager = {
  init() {
    const saved = localStorage.getItem('shopverse_theme') || 'dark';
    this.apply(saved);
  },
  apply(theme) {
    const html = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', theme);
    }
    localStorage.setItem('shopverse_theme', theme);
    const select = document.getElementById('themeSelect');
    if (select) select.value = theme;
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  },
};

window.ui = ui;
window.themeManager = themeManager;
