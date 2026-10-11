// Orders Module
const ordersModule = {
  async load() {
    const container = document.getElementById('screen-orders');
    if (!container) return;
    ui.setPageTitle('My Orders');
    container.innerHTML = `<div class="page-header"><h1 class="page-title">My Orders</h1></div><div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      const orders = await api.orders.list();
      if (!orders || orders.length === 0) {
        container.innerHTML = `<div class="page-header"><h1 class="page-title">My Orders</h1></div>${ui.emptyState('📦', "You haven't placed any orders yet", 'Your order history will appear here.', `<button class="btn btn-primary" onclick="router.navigate('home')">Start Shopping</button>`)}`;
        return;
      }
      container.innerHTML = `
        <div class="page-header"><h1 class="page-title">My Orders</h1></div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${orders.map(o => this.renderOrderCard(o)).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Error', e.message);
    }
  },

  renderOrderCard(order) {
    const itemCount = (order.items || []).length;
    return `
      <div class="card" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <div style="font-weight:700;margin-bottom:4px;">#${order.orderNumber}</div>
          <div style="color:var(--color-text-secondary);font-size:0.8rem;">${ui.formatDate(order.createdAt)} · ${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
        </div>
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
          <div>${ui.statusBadge(order.orderStatus)}</div>
          <div>${ui.statusBadge(order.paymentStatus)}</div>
          <div style="font-weight:700;color:var(--color-primary);">${ui.formatPrice(order.totalAmount)}</div>
          <button class="btn btn-secondary btn-sm" onclick="router.navigate('order-detail', {orderId: ${order.id}})">View Details</button>
        </div>
      </div>
    `;
  },

  async loadDetail(orderId) {
    const container = document.getElementById('screen-order-detail');
    if (!container) return;
    ui.setPageTitle('Order Details');
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      const order = await api.orders.get(orderId);
      container.innerHTML = `
        <button class="btn btn-ghost btn-sm" onclick="router.navigate('orders')" style="margin-bottom:20px;">← Back to My Orders</button>
        <div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
          <div>
            <div class="card" style="margin-bottom:20px;">
              <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;">
                <div>
                  <div style="font-size:0.8rem;color:var(--color-text-muted);margin-bottom:4px;">ORDER NUMBER</div>
                  <div style="font-weight:700;font-size:1.2rem;">#${order.orderNumber}</div>
                  <div style="color:var(--color-text-secondary);font-size:0.8rem;margin-top:4px;">Placed on ${ui.formatDate(order.createdAt)}</div>
                </div>
                <div style="display:flex;gap:10px;">${ui.statusBadge(order.orderStatus)} ${ui.statusBadge(order.paymentStatus)}</div>
              </div>
            </div>
            <div class="card" style="margin-bottom:20px;">
              <div style="font-weight:700;margin-bottom:16px;">Items in this Order</div>
              ${(order.items || []).map(item => `
                <div style="display:flex;gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid var(--color-border);">
                  <img src="${item.productImageUrl || ''}" style="width:64px;height:64px;border-radius:var(--radius-md);object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=128'">
                  <div style="flex:1;">
                    <div style="font-weight:600;font-size:0.9rem;">${item.productName}</div>
                    ${item.productBrand ? `<div style="color:var(--color-text-muted);font-size:0.75rem;">${item.productBrand}</div>` : ''}
                    <div style="font-size:0.8rem;color:var(--color-text-secondary);margin-top:4px;">Qty: ${item.quantity} × ${ui.formatPrice(item.unitPrice)}</div>
                  </div>
                  <div style="font-weight:700;">${ui.formatPrice(item.subtotal)}</div>
                </div>`).join('')}
            </div>
            <div class="card">
              <div style="font-weight:700;margin-bottom:16px;">Delivery Details</div>
              <div style="color:var(--color-text-secondary);font-size:0.875rem;line-height:1.7;">
                <strong style="color:var(--color-text);">${order.address?.fullName || ''}</strong><br>
                📞 ${order.address?.phone || ''}<br>
                ${order.address?.addressLine || ''}<br>
                ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.postalCode || ''}<br>
                ${order.address?.country || 'India'}
              </div>
            </div>
          </div>
          <div class="order-summary-card">
            <div class="order-summary__title">Payment Summary</div>
            <div class="order-summary__row"><span>Subtotal</span><span>${ui.formatPrice(order.subtotal)}</span></div>
            <div class="order-summary__row"><span>Delivery</span><span>${order.deliveryCharge > 0 ? ui.formatPrice(order.deliveryCharge) : '<span style="color:var(--color-success);">Free</span>'}</span></div>
            <div class="order-summary__row total"><span>Total</span><span style="color:var(--color-primary);">${ui.formatPrice(order.totalAmount)}</span></div>
            <div class="divider"></div>
            <div class="order-summary__row"><span>Method</span><span>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
            ${order.payment?.razorpayPaymentId ? `<div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:6px;word-break:break-all;">Transaction ID: ${order.payment.razorpayPaymentId}</div>` : ''}
            ${order.paymentMethod === 'RAZORPAY' && order.paymentStatus === 'PENDING' ? `
              <button class="btn btn-primary w-full" style="margin-top:16px;" onclick="paymentModule.initiateRazorpay(${JSON.stringify(order).replace(/"/g, '&quot;')})">Retry Online Payment</button>
            ` : ''}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Order not found', e.message, `<button class="btn btn-secondary" onclick="router.navigate('orders')">My Orders</button>`);
    }
  },
};

window.ordersModule = ordersModule;
