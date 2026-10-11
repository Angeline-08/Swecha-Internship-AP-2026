// ShopVerse Admin Panel
(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(value || 0));
  const listOf = result => Array.isArray(result) ? result : (result?.content || result?.items || []);
  const admin = {
    current: 'dashboard',
    async start() {
      const token = localStorage.getItem('shopverse_token');
      if (!token) { location.href = 'index.html'; return; }
      const user = JSON.parse(localStorage.getItem('shopverse_user') || '{}');
      const avatar = $('#userAvatar');
      if (avatar) avatar.textContent = (user.name || user.email || 'A').slice(0,1).toUpperCase();
      $('#dropdownLogoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('shopverse_token'); localStorage.removeItem('shopverse_user');
        location.href = 'index.html';
      });
      $('#sidebarToggle')?.addEventListener('click', () => $('#sidebar')?.classList.toggle('collapsed'));
      $('#sidebarOverlay')?.addEventListener('click', () => $('#sidebar')?.classList.remove('open'));
      $$('.nav-item[data-screen]').forEach(link => link.addEventListener('click', e => {
        e.preventDefault(); this.navigate(link.dataset.screen);
      }));
      $('#globalSearch')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const term = e.target.value.trim(); this.navigate('products'); if (term) ui.info('Use the product list to locate and edit items.'); }
      });
      await this.navigate(location.hash.slice(1) || 'dashboard');
    },
    async navigate(screen) {
      const allowed = ['dashboard','products','categories','orders','payments','customers','settings'];
      this.current = allowed.includes(screen) ? screen : 'dashboard';
      $$('.nav-item[data-screen]').forEach(a => a.classList.toggle('active', a.dataset.screen === this.current));
      $$('.screen').forEach(s => s.classList.remove('active'));
      $(`#admin-screen-${this.current}`)?.classList.add('active');
      location.hash = this.current;
      const container = $(`#admin-screen-${this.current}`);
      if (!container) return;
      container.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';
      try {
        if (this.current === 'dashboard') await this.dashboard(container);
        else if (this.current === 'products') await this.products(container);
        else if (this.current === 'categories') await this.categories(container);
        else if (this.current === 'orders') await this.orders(container);
        else if (this.current === 'customers') await this.customers(container);
        else if (this.current === 'payments') await this.payments(container);
        else this.settings(container);
      } catch (error) {
        container.innerHTML = `<section class="card p-4"><h2>Could not load ${esc(this.current)}</h2><p>${esc(error.message || 'Please try again.')}</p><button class="btn btn-primary" id="retryAdmin">Retry</button></section>`;
        $('#retryAdmin', container)?.addEventListener('click', () => this.navigate(this.current));
        if (error.message === 'Unauthorized') ui.error('Your session expired or you do not have admin access.');
        else ui.error(error.message || 'Unable to load admin data.');
      }
    },
    async dashboard(container) {
      const d = await api.admin.dashboard();
      const cards = [
        ['Total orders', d.totalOrders ?? d.ordersCount ?? 0],
        ['Revenue', money(d.totalRevenue ?? d.revenue ?? 0)],
        ['Products', d.totalProducts ?? d.productsCount ?? 0],
        ['Customers', d.totalCustomers ?? d.customersCount ?? 0]
      ];
      container.innerHTML = `<div class="screen-heading"><div><h1>Dashboard</h1><p>ShopVerse store overview</p></div><button class="btn btn-primary" id="refreshDashboard">Refresh</button></div><div class="stats-grid">${cards.map(([label,value])=>`<article class="stat-card card"><p>${esc(label)}</p><h2>${esc(value)}</h2></article>`).join('')}</div><section class="card p-4 mt-4"><h2>Quick actions</h2><div class="quick-actions"><button class="btn btn-primary" data-go="products">Manage products</button><button class="btn btn-secondary" data-go="orders">Review orders</button><button class="btn btn-secondary" data-go="categories">Manage categories</button></div></section>`;
      $('#refreshDashboard',container).onclick=()=>this.navigate('dashboard');
      $$('[data-go]',container).forEach(b=>b.onclick=()=>this.navigate(b.dataset.go));
    },
    async products(container) {
      const result = await api.admin.products.list();
      const items = listOf(result);
      container.innerHTML = `<div class="screen-heading"><div><h1>Products</h1><p>Create and manage your catalog</p></div><button class="btn btn-primary" id="addProduct">+ Add product</button></div><section class="card table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead><tbody>${items.map(p=>`<tr><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${esc(p.stock ?? 0)}</td><td>${esc(p.categoryName || p.category?.name || '—')}</td><td><button class="btn btn-danger btn-sm" data-delete="${esc(p.id)}">Delete</button></td></tr>`).join('') || '<tr><td colspan="5">No products found.</td></tr>'}</tbody></table></section>`;
      $('#addProduct',container).onclick=()=>this.productForm();
      $$('[data-delete]',container).forEach(b=>b.onclick=()=>ui.confirm('Delete this product?',async()=>{try{await api.admin.products.delete(b.dataset.delete);ui.success('Product deleted.');this.navigate('products')}catch(e){ui.error(e.message)}},'Delete',true));
    },
    async productForm() {
      let cats=[];
      try { cats=listOf(await api.admin.categories.list()); } catch(e) { ui.error('Could not load categories: '+e.message); return; }
      const modal=ui.createModal('Add product',`<form id="productForm" class="form-grid"><label>Name<input name="name" required maxlength="160"></label><label>Brand<input name="brand"></label><label>Category<select name="categoryId" required>${cats.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><label>Price (INR)<input name="price" type="number" min="0.01" step="0.01" required></label><label>Discount (%)<input name="discountPercent" type="number" min="0" max="100" value="0"></label><label>Stock<input name="stock" type="number" min="0" step="1" value="0" required></label><label class="full-width">Image URL<input name="imageUrl" type="url" placeholder="https://…"></label><label class="full-width">Description<textarea name="description" rows="3"></textarea></label><div class="full-width"><button class="btn btn-primary" type="submit">Save product</button></div></form>`);
      $('#productForm',modal).onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const data=Object.fromEntries(f.entries());data.categoryId=Number(data.categoryId);data.price=Number(data.price);data.stock=Number(data.stock);data.discountPercent=Number(data.discountPercent||0);try{await api.admin.products.create(data);modal.remove();ui.success('Product created.');this.navigate('products')}catch(err){ui.error(err.message)}};
    },
    async categories(container) {
      const cats=listOf(await api.admin.categories.list());
      container.innerHTML=`<div class="screen-heading"><div><h1>Categories</h1><p>Organize products in your store</p></div><button class="btn btn-primary" id="addCategory">+ Add category</button></div><section class="card table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>${cats.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.description||'—')}</td><td><button class="btn btn-danger btn-sm" data-delete="${esc(c.id)}">Delete</button></td></tr>`).join('')||'<tr><td colspan="3">No categories found.</td></tr>'}</tbody></table></section>`;
      $('#addCategory',container).onclick=()=>{const m=ui.createModal('Add category',`<form id="categoryForm"><label>Name<input name="name" required></label><label>Description<textarea name="description" rows="3"></textarea></label><button class="btn btn-primary" type="submit">Save category</button></form>`);$('#categoryForm',m).onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));try{await api.admin.categories.create(d);m.remove();ui.success('Category created.');this.navigate('categories')}catch(err){ui.error(err.message)}}};
      $$('[data-delete]',container).forEach(b=>b.onclick=()=>ui.confirm('Delete this category? Categories containing products may not be removable.',async()=>{try{await api.admin.categories.delete(b.dataset.delete);ui.success('Category deleted.');this.navigate('categories')}catch(e){ui.error(e.message)}},'Delete',true));
    },
    async orders(container) {
      const items=listOf(await api.admin.orders.list());
      container.innerHTML=`<div class="screen-heading"><div><h1>Orders</h1><p>Review orders and update their status</p></div><button class="btn btn-secondary" id="refreshList">Refresh</button></div><section class="card table-wrap"><table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead><tbody>${items.map(o=>`<tr><td>#${esc(o.orderNumber||o.id)}</td><td>${esc(o.customerName||o.userName||o.user?.name||'—')}</td><td>${money(o.totalAmount??o.total)}</td><td>${esc(o.status)}</td><td><select data-status="${esc(o.id)}"><option value="">Choose…</option>${['CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s=>`<option value="${s}">${s}</option>`).join('')}</select><button class="btn btn-primary btn-sm" data-update="${esc(o.id)}">Save</button></td></tr>`).join('')||'<tr><td colspan="5">No orders found.</td></tr>'}</tbody></table></section>`;
      $('#refreshList',container).onclick=()=>this.navigate('orders');
      $$('[data-update]',container).forEach(b=>b.onclick=async()=>{const s=$(`[data-status="${b.dataset.update}"]`,container).value;if(!s){ui.warning('Choose a status first.');return}try{await api.admin.orders.updateStatus(b.dataset.update,s);ui.success('Order status updated.');this.navigate('orders')}catch(e){ui.error(e.message)}});
    },
    async customers(container) {
      const items=listOf(await api.admin.customers.list());
      container.innerHTML=`<div class="screen-heading"><div><h1>Customers</h1><p>Registered customer accounts</p></div></div><section class="card table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead><tbody>${items.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.createdAt||'—')}</td></tr>`).join('')||'<tr><td colspan="3">No customers found.</td></tr>'}</tbody></table></section>`;
    },
    async payments(container) {
      const items=listOf(await api.admin.payments.list());
      container.innerHTML=`<div class="screen-heading"><div><h1>Payments</h1><p>Payment records and transaction status</p></div></div><section class="card table-wrap"><table class="data-table"><thead><tr><th>Payment</th><th>Order</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${items.map(p=>`<tr><td>${esc(p.id)}</td><td>${esc(p.orderNumber||p.orderId||'—')}</td><td>${esc(p.method||p.provider||'—')}</td><td>${money(p.amount)}</td><td>${esc(p.status)}</td></tr>`).join('')||'<tr><td colspan="5">No payments found.</td></tr>'}</tbody></table></section>`;
    },
    settings(container) {
      container.innerHTML=`<div class="screen-heading"><div><h1>Settings</h1><p>Admin session settings</p></div></div><section class="card p-4"><h2>Session</h2><p>Sign out of the ShopVerse admin panel on this device.</p><button class="btn btn-danger" id="adminLogout">Log out</button></section>`;
      $('#adminLogout',container).onclick=()=>{localStorage.removeItem('shopverse_token');localStorage.removeItem('shopverse_user');location.href='index.html'};
    }
  };
  window.shopverseAdmin = admin;
  document.addEventListener('DOMContentLoaded', () => admin.start());
})();
