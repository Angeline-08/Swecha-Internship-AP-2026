// Payment Module - Razorpay Integration & Confirmation
const paymentModule = {
  async initiateRazorpay(order) {
    const btn = document.getElementById('placeOrderBtn');
    if (btn) ui.setLoading(btn, true, 'Opening secure payment...');
    try {
      const payData = await api.payments.createOrder(order.id);
      await this.loadRazorpayScript();
      
      const options = {
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency || 'INR',
        name: 'ShopVerse',
        description: `Order #${order.orderNumber}`,
        order_id: payData.razorpayOrderId,
        handler: async (response) => {
          await this.verifyPayment(order.id, payData.razorpayOrderId, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: appState.user?.name || '',
          email: appState.user?.email || '',
        },
        theme: { color: '#14B8A6' },
        modal: {
          ondismiss: () => {
            ui.warning('Payment was cancelled. You can retry from your Orders screen.');
            if (btn) ui.setLoading(btn, false);
            router.navigate('orders');
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        ui.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
        if (btn) ui.setLoading(btn, false);
        router.navigate('orders');
      });
      rzp.open();
    } catch (e) {
      ui.error(e.message || 'Could not initiate payment');
      if (btn) ui.setLoading(btn, false);
    }
  },

  async loadRazorpayScript() {
    if (window.Razorpay) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.head.appendChild(script);
    });
  },

  async verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const result = await api.payments.verify({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature });
      ui.success('Payment verified successfully! 🎉');
      await appState.refreshCart();
      router.navigate('confirmation', { orderId });
    } catch (e) {
      ui.error('Payment verification failed: ' + e.message);
      router.navigate('orders');
    }
  },
};

// Confirmation screen
const confirmationModule = {
  async load(orderId) {
    const container = document.getElementById('screen-confirmation');
    if (!container) return;
    ui.setPageTitle('Order Confirmation');
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      const order = await api.orders.get(orderId);
      container.innerHTML = `
        <div class="confirmation-screen">
          <div class="confirmation__icon">✅</div>
          <h1 class="confirmation__title">Order Placed Successfully!</h1>
          <p class="confirmation__subtitle">Thank you for your order. We are preparing it for delivery.</p>
          <div class="confirmation__details">
            <div class="confirmation__detail-row"><span style="color:var(--color-text-secondary);">Order Number</span><span style="font-weight:700;">#${order.orderNumber}</span></div>
            <div class="confirmation__detail-row"><span style="color:var(--color-text-secondary);">Total Amount</span><span style="font-weight:700;color:var(--color-primary);">${ui.formatPrice(order.totalAmount)}</span></div>
            <div class="confirmation__detail-row"><span style="color:var(--color-text-secondary);">Payment Method</span><span>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
            <div class="confirmation__detail-row"><span style="color:var(--color-text-secondary);">Payment Status</span><span>${ui.statusBadge(order.paymentStatus)}</span></div>
            <div class="confirmation__detail-row"><span style="color:var(--color-text-secondary);">Order Status</span><span>${ui.statusBadge(order.orderStatus)}</span></div>
            <div class="confirmation__detail-row"><span style="color:var(--color-text-secondary);">Estimated Delivery</span><span style="font-weight:600;">3-5 Business Days</span></div>
          </div>
          <div class="confirmation__actions">
            <button class="btn btn-secondary" onclick="router.navigate('order-detail', {orderId: ${order.id}})">View Order</button>
            <button class="btn btn-primary" onclick="router.navigate('home')">Continue Shopping</button>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Order details unavailable', e.message, `<button class="btn btn-secondary" onclick="router.navigate('orders')">View Orders</button>`);
    }
  },
};

window.paymentModule = paymentModule;
window.confirmationModule = confirmationModule;
