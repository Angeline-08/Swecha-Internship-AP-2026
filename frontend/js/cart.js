// Cart Module
const cartModule = {
  cart: null,

  async loadScreen() {
    const container = document.getElementById('screen-cart');
    if (!container) return;
    ui.setPageTitle('My Cart');
    container.innerHTML = `<div class="page-header"><h1 class="page-title">Shopping Cart</h1></div><div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      this.cart = await api.cart.get();
      this.renderScreen();
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Error', e.message);
    }
  },

  renderScreen() {
    const container = document.getElementById('screen-cart');
    if (!container) return;
    const cart = this.cart;
    if (!cart || !cart.items || cart.items.length === 0) {
      container.innerHTML = `<div class="page-header"><h1 class="page-title">Shopping Cart</h1></div>${ui.emptyState('🛒', 'Your cart is empty', 'Add some products to get started!', `<button class="btn btn-primary" onclick="router.navigate('home')">Start Shopping</button>`)}`;
      return;
    }
    container.innerHTML = `
      <div class="page-header"><h1 class="page-title">Shopping Cart <span style="color:var(--color-text-muted);font-size:1rem;font-weight:400;">(${cart.items.length} item${cart.items.length !== 1 ? 's' : ''})</span></h1></div>
      <div class="cart-layout">
        <div id="cartItems">${this.renderItems(cart.items)}</div>
        <div>${this.renderSummary(cart)}</div>
      </div>
    `;
  },

  renderItems(items) {
    return items.map(item => `
      <div class="cart-item" id="cart-item-${item.id}">
        <img class="cart-item__image" src="${item.product?.imageUrl || ''}" alt="${item.product?.name || ''}" onerror="this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200'" onclick="router.navigate('product-detail', {productId: ${item.product?.id}})" style="cursor:pointer;">
        <div class="cart-item__details">
          <div class="cart-item__name" onclick="router.navigate('product-detail', {productId: ${item.product?.id}})" style="cursor:pointer;">${item.product?.name || ''}</div>
          ${item.product?.brand ? `<div class="cart-item__brand">${item.product.brand}</div>` : ''}
          <div style="color:var(--color-primary);font-size:0.8rem;margin-top:4px;">${ui.formatPrice(item.product?.discountedPrice || item.product?.price || 0)} each</div>
          <div class="cart-item__bottom">
            <div class="quantity-selector">
              <button class="qty-btn" onclick="cartModule.updateQty(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="cartModule.updateQty(${item.id}, ${item.quantity + 1})" ${item.quantity >= (item.product?.stock || 99) ? 'disabled' : ''}>+</button>
            </div>
            <div class="cart-item__subtotal">${ui.formatPrice(item.subtotal)}</div>
          </div>
          <div class="cart-item__actions" style="margin-top:8px;">
            <button class="cart-item__action-btn" onclick="cartModule.moveToWishlist(${item.id}, ${item.product?.id})">🤍 Save for Later</button>
            <button class="cart-item__action-btn remove" onclick="cartModule.removeItem(${item.id})">🗑️ Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderSummary(cart) {
    return `
      <div class="order-summary-card">
        <div class="order-summary__title">Order Summary</div>
        <div class="order-summary__row"><span>Subtotal</span><span>${ui.formatPrice(cart.subtotal)}</span></div>
        <div class="order-summary__row"><span>Delivery</span><span>${cart.deliveryCharge > 0 ? ui.formatPrice(cart.deliveryCharge) : '<span class="order-summary__free">Free</span>'}</span></div>
        ${cart.deliveryCharge > 0 ? `<div style="font-size:0.75rem;color:var(--color-text-muted);padding:4px 0;">Free delivery on orders above ₹999</div>` : ''}
        <div class="order-summary__row total"><span>Total</span><span style="color:var(--color-primary);">${ui.formatPrice(cart.total)}</span></div>
        <button class="btn btn-primary w-full" style="margin-top:20px;" onclick="router.navigate('checkout')">Proceed to Checkout →</button>
        <button class="btn btn-ghost w-full" style="margin-top:8px;" onclick="router.navigate('home')">Continue Shopping</button>
      </div>
    `;
  },

  async addToCart(productId, quantity = 1, btn = null) {
    if (!localStorage.getItem('shopverse_token')) {
      ui.warning('Please log in to add items to cart');
      return;
    }
    if (btn) ui.setLoading(btn, true, '');
    try {
      const cart = await api.cart.addItem(productId, quantity);
      const count = (cart.items || []).reduce((sum, i) => sum + i.quantity, 0);
      appState.updateCartBadge(count);
      ui.success('Added to cart! 🛒');
    } catch (e) {
      ui.error(e.message || 'Could not add to cart');
    } finally {
      if (btn) ui.setLoading(btn, false);
    }
  },

  async updateQty(itemId, newQty) {
    if (newQty <= 0) { this.removeItem(itemId); return; }
    try {
      const cart = await api.cart.updateItem(itemId, newQty);
      this.cart = cart;
      this.renderScreen();
      appState.updateCartBadge((cart.items || []).reduce((sum, i) => sum + i.quantity, 0));
    } catch (e) { ui.error(e.message); }
  },

  async removeItem(itemId) {
    try {
      const cart = await api.cart.removeItem(itemId);
      this.cart = cart;
      this.renderScreen();
      appState.updateCartBadge((cart.items || []).reduce((sum, i) => sum + i.quantity, 0));
      ui.info('Removed from cart.');
    } catch (e) { ui.error(e.message); }
  },

  async moveToWishlist(cartItemId, productId) {
    try {
      await api.wishlist.addItem(productId);
      const cart = await api.cart.removeItem(cartItemId);
      this.cart = cart;
      this.renderScreen();
      appState.updateCartBadge((cart.items || []).reduce((sum, i) => sum + i.quantity, 0));
      await appState.refreshWishlist();
      ui.success('Moved to wishlist! ❤️');
    } catch (e) { ui.error(e.message); }
  },
};

window.cartModule = cartModule;
