// Settings & Onboarding Module
const settingsModule = {
  settings: null,
  interests: [],
  categories: [],
  selectedInterestIds: new Set(),

  async load() {
    const container = document.getElementById('screen-settings');
    if (!container) return;
    ui.setPageTitle('Settings');
    container.innerHTML = `<div class="page-header"><h1 class="page-title">Settings</h1></div><div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      const [settings, interests, categories] = await Promise.all([
        api.user.settings(), api.user.interests(), api.categories.list()
      ]);
      this.settings = settings;
      this.interests = interests || [];
      this.categories = categories || [];
      this.selectedInterestIds = new Set(this.interests.map(i => i.id));
      this.render();
    } catch (e) {
      container.innerHTML = ui.emptyState('⚠️', 'Error', e.message);
    }
  },

  render() {
    const container = document.getElementById('screen-settings');
    if (!container) return;
    const interestIcons = { 'Electronics': '🔌', 'Men': '👔', 'Women': '👗', 'Home': '🏠', 'Beauty': '💄', 'Health': '💊', 'Sports': '⚽', 'Books': '📚', 'Grocery': '🛒', 'Toys': '🧸' };
    container.innerHTML = `
      <div class="page-header"><h1 class="page-title">Settings</h1></div>
      <div style="display:flex;flex-direction:column;gap:20px;max-width:700px;">
        <!-- Theme -->
        <div class="card">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">🎨 Appearance & Theme</h3>
          <div class="form-group">
            <label class="form-label">Theme Mode</label>
            <select class="form-input" id="themeSelect" style="max-width:240px;">
              <option value="dark" ${this.settings?.theme==='dark'?'selected':''}>🌙 Dark (Default)</option>
              <option value="light" ${this.settings?.theme==='light'?'selected':''}>☀️ Light</option>
              <option value="system" ${this.settings?.theme==='system'?'selected':''}>💻 System Preference</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm" onclick="settingsModule.saveTheme()">Save Theme</button>
        </div>
        <!-- Notifications -->
        <div class="card">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">🔔 Notifications</h3>
          <label style="display:flex;align-items:center;gap:14px;cursor:pointer;">
            <div style="position:relative;">
              <input type="checkbox" id="notifToggle" ${this.settings?.notificationsEnabled?'checked':''} style="opacity:0;position:absolute;">
              <div id="toggleTrack" style="width:48px;height:28px;background:${this.settings?.notificationsEnabled?'var(--color-primary)':'var(--color-border)'};border-radius:14px;transition:background 0.2s;position:relative;cursor:pointer;" onclick="settingsModule.toggleNotifications()">
                <div id="toggleThumb" style="width:22px;height:22px;background:white;border-radius:50%;position:absolute;top:3px;left:${this.settings?.notificationsEnabled?'23px':'3px'};transition:left 0.2s;"></div>
              </div>
            </div>
            <div>
              <div style="font-weight:600;">Email & In-App Alerts</div>
              <div style="font-size:0.8rem;color:var(--color-text-secondary);">Receive updates regarding order status and special offers</div>
            </div>
          </label>
        </div>
        <!-- Personalization -->
        <div class="card">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:8px;">⭐ Personalization & Interests</h3>
          <p style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:20px;">Select your preferred categories to customize your recommended products.</p>
          <div class="interests-grid">
            ${this.categories.map(cat => {
              const icon = Object.entries(interestIcons).find(([k]) => cat.name.includes(k))?.[1] || '🛍️';
              const selected = this.selectedInterestIds.has(cat.id);
              return `<div class="interest-chip ${selected?'selected':''}" id="interest-${cat.id}" onclick="settingsModule.toggleInterest(${cat.id})">
                <span class="interest-chip__icon">${icon}</span>
                <span class="interest-chip__label">${cat.name}</span>
              </div>`;
            }).join('')}
          </div>
          <button class="btn btn-primary btn-sm" id="saveInterestsBtn" onclick="settingsModule.saveInterests()">Save Interests</button>
        </div>
        <!-- Language -->
        <div class="card">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">🌐 Language & Region</h3>
          <div class="form-group">
            <label class="form-label">Language</label>
            <select class="form-input" id="langSelect" style="max-width:240px;">
              <option value="en" ${this.settings?.language==='en'?'selected':''}>English (India)</option>
              <option value="hi" ${this.settings?.language==='hi'?'selected':''}>हिन्दी (Hindi)</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm" onclick="settingsModule.saveLanguage()">Save Language</button>
        </div>
      </div>
    `;
  },

  async saveTheme() {
    const theme = document.getElementById('themeSelect')?.value || 'dark';
    themeManager.apply(theme);
    try {
      await api.user.updateSettings({ theme, notificationsEnabled: this.settings?.notificationsEnabled ?? true, language: this.settings?.language ?? 'en' });
      ui.success('Theme preference saved!');
    } catch (e) { ui.error(e.message); }
  },

  async toggleNotifications() {
    this.settings.notificationsEnabled = !this.settings.notificationsEnabled;
    const track = document.getElementById('toggleTrack');
    const thumb = document.getElementById('toggleThumb');
    if (track) track.style.background = this.settings.notificationsEnabled ? 'var(--color-primary)' : 'var(--color-border)';
    if (thumb) thumb.style.left = this.settings.notificationsEnabled ? '23px' : '3px';
    try {
      await api.user.updateSettings({ theme: this.settings.theme, notificationsEnabled: this.settings.notificationsEnabled, language: this.settings.language });
      ui.success(this.settings.notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled');
    } catch (e) { ui.error(e.message); }
  },

  toggleInterest(catId) {
    const chip = document.getElementById(`interest-${catId}`);
    if (this.selectedInterestIds.has(catId)) {
      this.selectedInterestIds.delete(catId);
      chip?.classList.remove('selected');
    } else {
      this.selectedInterestIds.add(catId);
      chip?.classList.add('selected');
    }
  },

  async saveInterests() {
    const btn = document.getElementById('saveInterestsBtn');
    ui.setLoading(btn, true, 'Saving...');
    try {
      await api.user.saveInterests([...this.selectedInterestIds]);
      ui.success('Product preferences saved! Home recommendations updated.');
    } catch (e) { ui.error(e.message); } finally { ui.setLoading(btn, false); }
  },

  async saveLanguage() {
    const lang = document.getElementById('langSelect')?.value || 'en';
    try {
      await api.user.updateSettings({ theme: this.settings?.theme, notificationsEnabled: this.settings?.notificationsEnabled, language: lang });
      ui.success('Language preference saved!');
    } catch (e) { ui.error(e.message); }
  },
};

// Onboarding Module
const onboardingModule = {
  categories: [],
  selectedIds: new Set(),

  async load() {
    const container = document.getElementById('screen-onboarding');
    if (!container) return;
    ui.setPageTitle('Welcome to ShopVerse');
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;"><div class="spinner spinner-lg"></div></div>`;
    try {
      this.categories = await api.categories.list();
      this.render();
    } catch (e) {
      this.skip();
    }
  },

  render() {
    const container = document.getElementById('screen-onboarding');
    if (!container) return;
    const interestIcons = { 'Electronics': '🔌', 'Men': '👔', 'Women': '👗', 'Home': '🏠', 'Beauty': '💄', 'Health': '💊', 'Sports': '⚽', 'Books': '📚' };
    container.innerHTML = `
      <div class="onboarding-screen">
        <div class="onboarding-card">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:3rem;margin-bottom:12px;">✨</div>
            <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:8px;">Let's personalize your ShopVerse</h2>
            <p style="color:var(--color-text-secondary);">Select the categories you love most to tune your personal recommendations.</p>
          </div>
          <div class="interests-grid" id="onboardingInterests">
            ${this.categories.map(cat => {
              const icon = Object.entries(interestIcons).find(([k]) => cat.name.includes(k))?.[1] || '🛍️';
              return `<div class="interest-chip" id="ob-${cat.id}" onclick="onboardingModule.toggle(${cat.id})">
                <span class="interest-chip__icon">${icon}</span>
                <span class="interest-chip__label">${cat.name}</span>
              </div>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px;">
            <button class="btn btn-ghost" onclick="onboardingModule.skip()">Skip for Now</button>
            <button class="btn btn-primary" id="obContinueBtn" onclick="onboardingModule.continue()">Continue →</button>
          </div>
        </div>
      </div>
    `;
  },

  toggle(catId) {
    const chip = document.getElementById(`ob-${catId}`);
    if (this.selectedIds.has(catId)) {
      this.selectedIds.delete(catId);
      chip?.classList.remove('selected');
    } else {
      this.selectedIds.add(catId);
      chip?.classList.add('selected');
    }
  },

  async continue() {
    const btn = document.getElementById('obContinueBtn');
    ui.setLoading(btn, true, 'Saving...');
    try {
      await api.user.saveInterests([...this.selectedIds]);
      const user = await api.user.me();
      localStorage.setItem('shopverse_user', JSON.stringify(user));
      appState.user = user;
      ui.success('Personalization complete!');
      await Promise.all([appState.refreshCart(), appState.refreshWishlist()]);
      router.navigate('home');
    } catch (e) {
      ui.error(e.message);
      ui.setLoading(btn, false);
    }
  },

  async skip() {
    try {
      await api.user.saveInterests([]);
    } catch (e) {}
    try {
      const user = await api.user.me();
      localStorage.setItem('shopverse_user', JSON.stringify(user));
      appState.user = user;
    } catch (e) {}
    await Promise.all([appState.refreshCart(), appState.refreshWishlist()]);
    router.navigate('home');
  },
};

window.settingsModule = settingsModule;
window.onboardingModule = onboardingModule;
