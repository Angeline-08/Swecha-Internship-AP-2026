// Checkout Module
const checkoutModule = {
  addresses: [],
  selectedAddressId: null,
  selectedPaymentMethod: 'COD', // 'COD' or 'RAZORPAY'
  cart: null,

  async load() {
    const container = document.getElementById('screen-checkout');
    if (!container) return;
    ui.setPageTitle('Checkout');
    container.innerHTML = `<div class="page-header"><h1 class="page-title">Checkout</h1></div><div style="display:flex;align-items:center;justify-content:center;height:300px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      const [cart, addresses] = await Promise.all([api.cart.get(), api.addresses.list()]);
      this.cart = cart;
      this.addresses = addresses || [];
      if (!cart || !cart.items || cart.items.length === 0) {
        container.innerHTML = ui.emptyState('🛒', 'Cart is empty', 'Add products before checkout.', `<button class="btn btn-primary" onclick="router.navigate('home')">Shop Now</button>`);
        return;
      }
      if (this.addresses.length > 0) {
        this.selectedAddressId = this.addresses.find(a => a.isDefault)?.id || this.addresses[0].id;
      } else {
        this.selectedAddressId = null;
      }
      this.renderCheckout();
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Error', e.message);
    }
  },

  renderCheckout() {
    const container = document.getElementById('screen-checkout');
    if (!container) return;
    container.innerHTML = `
      <div class="page-header"><h1 class="page-title">Checkout</h1></div>
      <div class="checkout-layout">
        <div>
          <!-- Step 1: Address -->
          <div class="checkout-section">
            <div class="checkout-section__title">
              <span class="checkout-section__num">1</span> Delivery Address
            </div>
            <div id="addressList">${this.renderAddressList()}</div>
            <button class="btn btn-secondary btn-sm" onclick="checkoutModule.showAddAddressForm()">+ Add New Address</button>
          </div>
          <!-- Step 2: Payment -->
          <div class="checkout-section">
            <div class="checkout-section__title">
              <span class="checkout-section__num">2</span> Payment Method
            </div>
            <div class="payment-option ${this.selectedPaymentMethod === 'RAZORPAY' ? 'selected' : ''}" onclick="checkoutModule.selectPayment('RAZORPAY')" id="payRazorpay">
              <div class="payment-option__radio"></div>
              <div class="payment-option__icon">💳</div>
              <div class="payment-option__info">
                <div class="payment-option__name">Pay Online (Razorpay)</div>
                <div class="payment-option__desc">Credit/Debit Card, UPI, Net Banking via Razorpay</div>
              </div>
            </div>
            <div class="payment-option ${this.selectedPaymentMethod === 'COD' ? 'selected' : ''}" onclick="checkoutModule.selectPayment('COD')" id="payCOD">
              <div class="payment-option__radio"></div>
              <div class="payment-option__icon">💵</div>
              <div class="payment-option__info">
                <div class="payment-option__name">Cash on Delivery</div>
                <div class="payment-option__desc">Pay when your order arrives</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Order Summary -->
        <div>
          <div class="order-summary-card">
            <div class="order-summary__title">Order Summary</div>
            <div style="margin-bottom:16px;">
              ${(this.cart.items || []).map(item => `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--color-border);">
                  <img src="${item.product?.imageUrl || ''}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80'">
                  <div style="flex:1;">
                    <div style="font-size:0.8rem;font-weight:500;">${item.product?.name || ''}</div>
                    <div style="font-size:0.75rem;color:var(--color-text-muted);">Qty: ${item.quantity}</div>
                  </div>
                  <div style="font-weight:600;font-size:0.875rem;">${ui.formatPrice(item.subtotal)}</div>
                </div>`).join('')}
            </div>
            <div class="order-summary__row"><span>Subtotal</span><span>${ui.formatPrice(this.cart.subtotal)}</span></div>
            <div class="order-summary__row"><span>Delivery</span><span>${this.cart.deliveryCharge > 0 ? ui.formatPrice(this.cart.deliveryCharge) : '<span class="order-summary__free">Free</span>'}</span></div>
            <div class="order-summary__row total"><span>Total</span><span style="color:var(--color-primary);">${ui.formatPrice(this.cart.total)}</span></div>
            <button class="btn btn-primary w-full" id="placeOrderBtn" style="margin-top:20px;" onclick="checkoutModule.placeOrder()">Place Order →</button>
          </div>
        </div>
      </div>
    `;
  },

  renderAddressList() {
    if (!this.addresses || this.addresses.length === 0) {
      return '<p style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:12px;">No saved addresses. Add one below.</p>';
    }
    return this.addresses.map(addr => `
      <div class="address-card ${this.selectedAddressId === addr.id ? 'selected' : ''}" onclick="checkoutModule.selectAddress(${addr.id})">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div class="address-card__name">${addr.fullName} ${addr.isDefault ? '<span class="badge badge-info" style="margin-left:6px;">Default</span>' : ''}</div>
            <div class="address-card__detail">📞 ${addr.phone}</div>
            <div class="address-card__detail">${addr.addressLine}, ${addr.city}, ${addr.state} - ${addr.postalCode}</div>
            <div class="address-card__detail">${addr.country}</div>
          </div>
          ${this.selectedAddressId === addr.id ? '<span style="color:var(--color-primary);font-size:1.5rem;">✓</span>' : ''}
        </div>
      </div>
    `).join('');
  },

  selectAddress(id) {
    this.selectedAddressId = id;
    const addressListEl = document.getElementById('addressList');
    if (addressListEl) addressListEl.innerHTML = this.renderAddressList();
  },

  selectPayment(method) {
    this.selectedPaymentMethod = method;
    ['RAZORPAY', 'COD'].forEach(m => {
      const el = document.getElementById(`pay${m === 'RAZORPAY' ? 'Razorpay' : 'COD'}`);
      el?.classList.toggle('selected', m === method);
    });
  },

  showAddAddressForm() {
    const formHtml = `
      <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" id="addrName" placeholder="Full Name"></div>
      <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" id="addrPhone" placeholder="10-digit mobile number"></div>
      <div class="form-group"><label class="form-label">Address Line</label><input type="text" class="form-input" id="addrLine" placeholder="Street, Area, Landmark"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">City</label><input type="text" class="form-input" id="addrCity" placeholder="City"></div>
        <div class="form-group"><label class="form-label">State</label><input type="text" class="form-input" id="addrState" placeholder="State"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Postal Code</label><input type="text" class="form-input" id="addrPostal" placeholder="6-digit code"></div>
        <div class="form-group"><label class="form-label">Country</label><input type="text" class="form-input" id="addrCountry" value="India"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="addrDefault"> Set as default address</label>
    `;
    ui.createModal('Add Delivery Address', formHtml,
      `<button class="btn btn-ghost" onclick="ui.closeAllModals()">Cancel</button>
       <button class="btn btn-primary" id="saveAddrBtn" onclick="checkoutModule.saveAddress()">Save Address</button>`
    );
  },

  async saveAddress() {
    const data = {
      fullName: document.getElementById('addrName')?.value.trim(),
      phone: document.getElementById('addrPhone')?.value.trim(),
      addressLine: document.getElementById('addrLine')?.value.trim(),
      city: document.getElementById('addrCity')?.value.trim(),
      state: document.getElementById('addrState')?.value.trim(),
      postalCode: document.getElementById('addrPostal')?.value.trim(),
      country: document.getElementById('addrCountry')?.value.trim() || 'India',
      isDefault: document.getElementById('addrDefault')?.checked || false,
    };
    if (!data.fullName || !data.phone || !data.addressLine || !data.city || !data.state || !data.postalCode) {
      ui.error('Please fill all required address fields'); return;
    }
    const btn = document.getElementById('saveAddrBtn');
    ui.setLoading(btn, true, 'Saving...');
    try {
      const addr = await api.addresses.create(data);
      this.addresses.push(addr);
      this.selectedAddressId = addr.id;
      ui.closeAllModals();
      const addressListEl = document.getElementById('addressList');
      if (addressListEl) addressListEl.innerHTML = this.renderAddressList();
      ui.success('Address saved!');
    } catch (e) { ui.error(e.message); } finally { ui.setLoading(btn, false); }
  },

  async placeOrder() {
    if (!this.selectedAddressId) { ui.error('Please select or add a delivery address'); return; }
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) { ui.error('Your cart is empty'); return; }
    const btn = document.getElementById('placeOrderBtn');
    ui.setLoading(btn, true, 'Placing order...');
    const orderData = {
      addressId: this.selectedAddressId,
      items: this.cart.items.map(i => ({ productId: i.product?.id, quantity: i.quantity })),
      paymentMethod: this.selectedPaymentMethod,
    };
    try {
      const order = await api.orders.create(orderData);
      if (this.selectedPaymentMethod === 'RAZORPAY') {
        ui.setLoading(btn, false);
        await paymentModule.initiateRazorpay(order);
      } else {
        ui.success('Order placed successfully! 🎉');
        await appState.refreshCart();
        router.navigate('confirmation', { orderId: order.id });
      }
    } catch (e) {
      ui.error(e.message || 'Could not place order');
      ui.setLoading(btn, false);
    }
  },
};

window.checkoutModule = checkoutModule;
