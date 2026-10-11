// Account Module
const accountModule = {
  currentTab: 'profile',

  async load(tab = 'profile') {
    const container = document.getElementById('screen-account');
    if (!container) return;
    ui.setPageTitle('My Account');
    this.currentTab = tab;
    container.innerHTML = `
      <div class="page-header"><h1 class="page-title">My Account</h1></div>
      <div class="account-layout">
        <div class="account-nav">
          <div class="account-nav-item ${tab==='profile'?'active':''}" onclick="accountModule.switchTab('profile')">👤 Profile</div>
          <div class="account-nav-item ${tab==='addresses'?'active':''}" onclick="accountModule.switchTab('addresses')">📍 Addresses</div>
          <div class="account-nav-item ${tab==='security'?'active':''}" onclick="accountModule.switchTab('security')">🔒 Security</div>
        </div>
        <div id="accountContent"><div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner spinner-lg"></div></div></div>
      </div>
    `;
    this.loadTab(tab);
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.account-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.account-nav-item[onclick*="'${tab}'"]`)?.classList.add('active');
    this.loadTab(tab);
  },

  async loadTab(tab) {
    const content = document.getElementById('accountContent');
    if (!content) return;
    content.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner spinner-lg"></div></div>`;
    if (tab === 'profile') await this.loadProfile(content);
    else if (tab === 'addresses') await this.loadAddresses(content);
    else if (tab === 'security') this.loadSecurity(content);
  },

  async loadProfile(content) {
    try {
      const user = await api.user.me();
      content.innerHTML = `
        <div class="card">
          <div style="display:flex;align-items:center;gap:20px;margin-bottom:32px;">
            <div style="width:72px;height:72px;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:1.75rem;font-weight:700;">${user.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div>
              <div style="font-size:1.25rem;font-weight:700;">${user.name}</div>
              <div style="color:var(--color-text-secondary);">${user.email}</div>
              <div style="color:var(--color-text-muted);font-size:0.8rem;margin-top:4px;">Member since ${ui.formatDate(user.createdAt)}</div>
            </div>
          </div>
          <form id="profileForm">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div class="form-group"><label class="form-label">Full Name</label><input type="text" id="profileName" class="form-input" value="${user.name || ''}" required></div>
              <div class="form-group"><label class="form-label">Phone Number</label><input type="tel" id="profilePhone" class="form-input" value="${user.phone || ''}" placeholder="+91 XXXXX XXXXX"></div>
              <div class="form-group" style="grid-column: span 2;"><label class="form-label">Email Address (Read-only)</label><input type="email" class="form-input" value="${user.email}" disabled style="opacity:0.6;"></div>
            </div>
            <button type="submit" class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
          </form>
        </div>
      `;
      document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('saveProfileBtn');
        ui.setLoading(btn, true, 'Saving...');
        try {
          const updated = await api.user.updateProfile({ name: document.getElementById('profileName').value.trim(), phone: document.getElementById('profilePhone').value.trim() });
          localStorage.setItem('shopverse_user', JSON.stringify(updated));
          appState.user = updated;
          const avatarName = document.getElementById('userAvatarName');
          if (avatarName) avatarName.textContent = updated.name;
          const userAvatar = document.getElementById('userAvatar');
          if (userAvatar) userAvatar.textContent = updated.name?.charAt(0).toUpperCase();
          ui.success('Profile updated!');
        } catch (err) { ui.error(err.message); } finally { ui.setLoading(btn, false); }
      });
    } catch (e) { content.innerHTML = ui.emptyState('⚠️', 'Error', e.message); }
  },

  async loadAddresses(content) {
    try {
      const addrs = await api.addresses.list();
      content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="font-size:1.1rem;font-weight:700;">Saved Delivery Addresses</h2>
          <button class="btn btn-secondary btn-sm" onclick="accountModule.showAddressForm(null)">+ Add New Address</button>
        </div>
        ${!addrs || addrs.length === 0 ? ui.emptyState('📍', 'No addresses saved', 'Add your delivery addresses for seamless checkout.') :
          addrs.map(addr => `
            <div class="card" style="margin-bottom:16px;">
              <div style="display:flex;justify-content:space-between;align-items:start;">
                <div>
                  <div style="font-weight:600;margin-bottom:4px;">${addr.fullName} ${addr.isDefault ? '<span class="badge badge-info">Default</span>' : ''}</div>
                  <div style="color:var(--color-text-secondary);font-size:0.875rem;">📞 ${addr.phone}</div>
                  <div style="color:var(--color-text-secondary);font-size:0.875rem;">${addr.addressLine}, ${addr.city}, ${addr.state} - ${addr.postalCode}</div>
                  <div style="color:var(--color-text-secondary);font-size:0.875rem;">${addr.country}</div>
                </div>
                <div class="action-btns">
                  <button class="action-btn edit" onclick='accountModule.showAddressForm(${JSON.stringify(addr).replace(/'/g, "&apos;")})'>Edit</button>
                  <button class="action-btn delete" onclick="accountModule.deleteAddress(${addr.id})">Delete</button>
                </div>
              </div>
            </div>`).join('')
        }
      `;
    } catch (e) { content.innerHTML = ui.emptyState('⚠️', 'Error', e.message); }
  },

  showAddressForm(addr) {
    const isEdit = !!addr;
    const formHtml = `
      <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" id="addrFormName" value="${addr?.fullName||''}"></div>
      <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" id="addrFormPhone" value="${addr?.phone||''}"></div>
      <div class="form-group"><label class="form-label">Address Line</label><input type="text" class="form-input" id="addrFormLine" value="${addr?.addressLine||''}"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">City</label><input type="text" class="form-input" id="addrFormCity" value="${addr?.city||''}"></div>
        <div class="form-group"><label class="form-label">State</label><input type="text" class="form-input" id="addrFormState" value="${addr?.state||''}"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Postal Code</label><input type="text" class="form-input" id="addrFormPostal" value="${addr?.postalCode||''}"></div>
        <div class="form-group"><label class="form-label">Country</label><input type="text" class="form-input" id="addrFormCountry" value="${addr?.country||'India'}"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="addrFormDefault" ${addr?.isDefault?'checked':''}> Set as default address</label>
    `;
    ui.createModal(isEdit ? 'Edit Address' : 'Add New Address', formHtml,
      `<button class="btn btn-ghost" onclick="ui.closeAllModals()">Cancel</button>
       <button class="btn btn-primary" id="saveAddrFormBtn" onclick="accountModule.saveAddressForm(${isEdit?addr.id:'null'})">${isEdit?'Update':'Save'} Address</button>`
    );
  },

  async saveAddressForm(addressId) {
    const data = {
      fullName: document.getElementById('addrFormName')?.value.trim(),
      phone: document.getElementById('addrFormPhone')?.value.trim(),
      addressLine: document.getElementById('addrFormLine')?.value.trim(),
      city: document.getElementById('addrFormCity')?.value.trim(),
      state: document.getElementById('addrFormState')?.value.trim(),
      postalCode: document.getElementById('addrFormPostal')?.value.trim(),
      country: document.getElementById('addrFormCountry')?.value.trim() || 'India',
      isDefault: document.getElementById('addrFormDefault')?.checked || false,
    };
    if (!data.fullName || !data.phone || !data.addressLine || !data.city || !data.state || !data.postalCode) {
      ui.error('Please fill all required fields');
      return;
    }
    const btn = document.getElementById('saveAddrFormBtn');
    ui.setLoading(btn, true, 'Saving...');
    try {
      if (addressId) await api.addresses.update(addressId, data);
      else await api.addresses.create(data);
      ui.closeAllModals();
      ui.success('Address saved!');
      this.loadAddresses(document.getElementById('accountContent'));
    } catch (e) { ui.error(e.message); } finally { ui.setLoading(btn, false); }
  },

  async deleteAddress(id) {
    ui.confirm('Are you sure you want to delete this address?', async () => {
      try {
        await api.addresses.delete(id);
        ui.info('Address deleted.');
        this.loadAddresses(document.getElementById('accountContent'));
      } catch (e) { ui.error(e.message); }
    }, 'Delete', true);
  },

  loadSecurity(content) {
    content.innerHTML = `
      <div class="card">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:24px;">Change Password</h2>
        <form id="passwordForm">
          <div class="form-group"><label class="form-label">Current Password</label><input type="password" id="currentPw" class="form-input" placeholder="Enter current password" required></div>
          <div class="form-group"><label class="form-label">New Password</label><input type="password" id="newPw" class="form-input" placeholder="Min 8 characters" required></div>
          <div class="form-group"><label class="form-label">Confirm New Password</label><input type="password" id="confirmPw" class="form-input" placeholder="Repeat new password" required></div>
          <div class="form-error" id="pwError" style="margin-bottom:12px;"></div>
          <button type="submit" class="btn btn-primary" id="changePwBtn">Update Password</button>
        </form>
      </div>
    `;
    document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwError = document.getElementById('pwError');
      if (pwError) pwError.textContent = '';
      const current = document.getElementById('currentPw').value;
      const newPw = document.getElementById('newPw').value;
      const confirm = document.getElementById('confirmPw').value;
      if (newPw.length < 8) { if (pwError) pwError.textContent = 'Password must be at least 8 characters'; return; }
      if (newPw !== confirm) { if (pwError) pwError.textContent = 'Passwords do not match'; return; }
      const btn = document.getElementById('changePwBtn');
      ui.setLoading(btn, true, 'Updating...');
      try {
        await api.user.changePassword({ currentPassword: current, newPassword: newPw });
        ui.success('Password changed successfully!');
        document.getElementById('passwordForm').reset();
      } catch (err) {
        if (pwError) pwError.textContent = err.message;
      } finally { ui.setLoading(btn, false); }
    });
  },
};

window.accountModule = accountModule;
