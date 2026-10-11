// Wishlist Module
const wishlistModule = {
  wishlist: null,

  async loadScreen() {
    const container = document.getElementById('screen-wishlist');
    if (!container) return;
    ui.setPageTitle('Wishlist');
    container.innerHTML = `<div class="page-header"><h1 class="page-title">My Wishlist</h1></div><div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      this.wishlist = await api.wishlist.get();
      this.renderScreen();
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Error', e.message);
    }
  },

  renderScreen() {
    const container = document.getElementById('screen-wishlist');
    if (!container) return;
    const items = this.wishlist?.items || [];
    if (items.length === 0) {
      container.innerHTML = `<div class="page-header"><h1 class="page-title">My Wishlist</h1></div>${ui.emptyState('❤️', 'Nothing saved yet', 'Add products to your wishlist to save them for later!', `<button class="btn btn-primary" onclick="router.navigate('home')">Explore Products</button>`)}`;
      return;
    }
    container.innerHTML = `
      <div class="page-header"><h1 class="page-title">My Wishlist <span style="color:var(--color-text-muted);font-size:1rem;font-weight:400;">(${items.length} item${items.length !== 1 ? 's' : ''})</span></h1></div>
      <div class="products-grid" id="wishlistGrid">
        ${items.map(item => this.renderWishlistItem(item)).join('')}
      </div>
    `;
  },

  renderWishlistItem(item) {
    const p = item.product;
    if (!p) return '';
    const discounted = p.discountedPrice || p.price;
    return `
      <div class="product-card" id="wishlist-item-${p.id}">
        <div class="product-card__image-wrapper" onclick="router.navigate('product-detail', {productId: ${p.id}})" style="cursor:pointer;">
          <img class="product-card__image" src="${p.imageUrl || ''}" alt="${p.name || ''}" onerror="this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'">
        </div>
        <div class="product-card__body">
          ${p.brand ? `<div class="product-card__brand">${p.brand}</div>` : ''}
          <div class="product-card__name" onclick="router.navigate('product-detail', {productId: ${p.id}})" style="cursor:pointer;">${p.name || ''}</div>
          <div class="product-card__price-row">
            <span class="product-card__price">${ui.formatPrice(discounted)}</span>
            ${p.discountPercent > 0 ? `<span class="product-card__original-price">${ui.formatPrice(p.price)}</span>` : ''}
          </div>
          <div class="product-card__footer" style="display:flex;gap:8px;flex-direction:column;">
            <button class="btn btn-primary btn-sm" onclick="wishlistModule.moveToCart(${p.id})">Add to Cart</button>
            <button class="btn btn-ghost btn-sm" onclick="wishlistModule.remove(${p.id})">Remove</button>
          </div>
        </div>
      </div>
    `;
  },

  async toggle(productId, btnEl) {
    if (!localStorage.getItem('shopverse_token')) {
      ui.warning('Please log in to save to wishlist');
      return;
    }
    const isInWishlist = appState.wishlistIds.has(productId);
    try {
      if (isInWishlist) {
        await api.wishlist.removeItem(productId);
        appState.wishlistIds.delete(productId);
        if (btnEl) { btnEl.classList.remove('active'); btnEl.innerHTML = '🤍'; }
        ui.info('Removed from wishlist.');
      } else {
        await api.wishlist.addItem(productId);
        appState.wishlistIds.add(productId);
        if (btnEl) { btnEl.classList.add('active'); btnEl.innerHTML = '❤️'; }
        ui.success('Added to wishlist! ❤️');
      }
      appState.updateWishlistBadge(appState.wishlistIds.size);
    } catch (e) { ui.error(e.message); }
  },

  async remove(productId) {
    try {
      this.wishlist = await api.wishlist.removeItem(productId);
      appState.wishlistIds.delete(productId);
      appState.updateWishlistBadge(appState.wishlistIds.size);
      this.renderScreen();
      ui.info('Removed from wishlist.');
    } catch (e) { ui.error(e.message); }
  },

  async moveToCart(productId) {
    try {
      const result = await api.wishlist.moveToCart(productId);
      this.wishlist = result.wishlist || this.wishlist;
      appState.wishlistIds.delete(productId);
      appState.updateWishlistBadge(appState.wishlistIds.size);
      const cartCount = (result.cart?.items || []).reduce((sum, i) => sum + i.quantity, 0) || 0;
      appState.updateCartBadge(cartCount);
      this.renderScreen();
      ui.success('Moved to cart! 🛒');
    } catch (e) { ui.error(e.message); }
  },
};

window.wishlistModule = wishlistModule;
