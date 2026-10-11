
 // Products Module - Search, Categories, Product Detail

const searchModule = {
  currentParams: {},
  currentPage: 0,

  async load(params = {}) {
    const container = document.getElementById('screen-search');
    if (!container) return;

    this.currentParams = { ...params };
    this.currentPage = 0;
    ui.setPageTitle('Search Products');

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Search Products</h1>
      </div>

      <div class="card" style="margin-bottom:24px;padding:20px;">
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;">
          <div class="form-group" style="flex:1;min-width:200px;margin:0;">
            <label class="form-label" for="searchQ">Search</label>
            <input type="text" id="searchQ" class="form-input"
              placeholder="Product name or brand..." value="">
          </div>

          <div class="form-group" style="min-width:160px;margin:0;">
            <label class="form-label" for="searchCategory">Category</label>
            <select id="searchCategory" class="form-input">
              <option value="">All Categories</option>
            </select>
          </div>

          <div class="form-group" style="min-width:120px;margin:0;">
            <label class="form-label" for="searchMinPrice">Min Price</label>
            <input type="number" id="searchMinPrice" class="form-input" placeholder="₹0" min="0">
          </div>

          <div class="form-group" style="min-width:120px;margin:0;">
            <label class="form-label" for="searchMaxPrice">Max Price</label>
            <input type="number" id="searchMaxPrice" class="form-input" placeholder="Any" min="0">
          </div>

          <div class="form-group" style="min-width:140px;margin:0;">
            <label class="form-label" for="searchSort">Sort By</label>
            <select id="searchSort" class="form-input">
              <option value="">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <button class="btn btn-primary" id="searchApplyBtn"
            onclick="searchModule.applySearch()">Search</button>
        </div>
      </div>

      <div id="searchResults">${ui.productGridSkeletons(8)}</div>
      <div id="searchPagination"
        style="display:flex;justify-content:center;padding:20px;"></div>
    `;

    document.getElementById('searchQ').value = params.q || '';

    try {
      const cats = await api.categories.list();
      const catSelect = document.getElementById('searchCategory');

      if (catSelect) {
        cats.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          if (String(params.categoryId || '') === String(category.id)) {
            option.selected = true;
          }
          catSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Could not load search categories:', error);
    }

    document.getElementById('searchQ')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') this.applySearch();
    });

    this.applySearch();
  },

  async applySearch() {
    this.currentPage = 0;
    await this.fetchResults();
  },

  async fetchResults() {
    const resultsEl = document.getElementById('searchResults');
    if (!resultsEl) return;

    resultsEl.innerHTML = ui.productGridSkeletons(8);

    const params = {
      q: document.getElementById('searchQ')?.value.trim() || '',
      categoryId: document.getElementById('searchCategory')?.value || '',
      minPrice: document.getElementById('searchMinPrice')?.value || '',
      maxPrice: document.getElementById('searchMaxPrice')?.value || '',
      sort: document.getElementById('searchSort')?.value || '',
      page: this.currentPage,
      size: 20
    };

    try {
      const result = await api.products.search(params);
      const products = result.content || [];

      if (products.length === 0) {
        resultsEl.innerHTML = ui.emptyState(
          '🔍',
          'No products found',
          'Try different search terms or filters.',
          `<button class="btn btn-secondary" onclick="searchModule.load()">Clear Filters</button>`
        );
      } else {
        resultsEl.innerHTML = `
          <div style="margin-bottom:12px;color:var(--color-text-secondary);font-size:0.875rem;">
            ${result.totalElements ?? products.length}
            result${(result.totalElements ?? products.length) !== 1 ? 's' : ''} found
          </div>
          <div class="products-grid">
            ${products.map(product =>
              ui.productCard(product, appState.wishlistIds)
            ).join('')}
          </div>
        `;
      }

      this.renderPagination(result);
    } catch (error) {
      resultsEl.innerHTML = ui.emptyState('⚠️', 'Error', error.message);
    }
  },

  renderPagination(page) {
    const el = document.getElementById('searchPagination');
    if (!el) return;

    if (!page || page.totalPages <= 1) {
      el.innerHTML = '';
      return;
    }

    let html = `
      <button class="page-btn" ${this.currentPage === 0 ? 'disabled' : ''}
        onclick="searchModule.goToPage(${this.currentPage - 1})">‹ Prev</button>
    `;

    for (let i = 0; i < page.totalPages; i++) {
      html += `
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}"
          onclick="searchModule.goToPage(${i})">${i + 1}</button>
      `;
    }

    html += `
      <button class="page-btn" ${page.last ? 'disabled' : ''}
        onclick="searchModule.goToPage(${this.currentPage + 1})">Next ›</button>
    `;

    el.innerHTML = html;
  },

  goToPage(page) {
    if (page < 0) return;

    this.currentPage = page;
    this.fetchResults();
    document.getElementById('screen-search')?.scrollTo(0, 0);
  }
};


// Categories screen

const categoriesModule = {
  async load(params = {}) {
    const container = document.getElementById('screen-categories');
    if (!container) return;

    ui.setPageTitle('Categories');

    if (params.categoryId !== undefined && params.categoryId !== null && params.categoryId !== '') {
      await this.showCategoryProducts(
        params.categoryId,
        params.categoryName || 'Category'
      );
      return;
    }

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Browse Categories</h1>
      </div>
      <div id="categoriesGrid">
        ${ui.productGridSkeletons(8, 'products-grid-lg')}
      </div>
    `;

    try {
      const cats = await api.categories.list();
      const categoriesGrid = document.getElementById('categoriesGrid');
      if (!categoriesGrid) return;

      const catIcons = [
        { keyword: 'Electronics', icon: '🔌' },
        { keyword: 'Appliances', icon: '🔌' },
        { keyword: 'Men', icon: '👔' },
        { keyword: 'Women', icon: '👗' },
        { keyword: 'Home', icon: '🏠' },
        { keyword: 'Kitchen', icon: '🍳' },
        { keyword: 'Beauty', icon: '💄' },
        { keyword: 'Health', icon: '💊' },
        { keyword: 'Fitness', icon: '🏋️' },
        { keyword: 'Sports', icon: '⚽' },
        { keyword: 'Books', icon: '📚' },
        { keyword: 'Grocery', icon: '🛒' },
        { keyword: 'Toys', icon: '🧸' },
        { keyword: 'Kids', icon: '👧' },
        { keyword: 'Video', icon: '🎮' }
      ];

      categoriesGrid.innerHTML = `
        <div class="products-grid-lg">
          ${cats.map(category => {
            const match = catIcons.find(item =>
              category.name.includes(item.keyword)
            );
            const icon = match ? match.icon : '🛍️';

            return `
              <div
                class="card card-elevated category-card"
                data-category-id="${category.id}"
                style="cursor:pointer;text-align:center;padding:32px 20px;"
                role="button"
                tabindex="0"
              >
                <div style="font-size:2.5rem;margin-bottom:12px;">${icon}</div>
                <div style="font-weight:600;margin-bottom:4px;">
                  ${category.name}
                </div>
                <div style="color:var(--color-text-secondary);font-size:0.8rem;">
                  ${category.description || ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      const openCategory = card => {
        const categoryId = Number(card.dataset.categoryId);
        const category = cats.find(item => Number(item.id) === categoryId);
        if (!category) return;

        router.navigate('categories', {
          categoryId: category.id,
          categoryName: category.name
        });
      };

      categoriesGrid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => openCategory(card));

        card.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openCategory(card);
          }
        });
      });
    } catch (error) {
      const categoriesGrid = document.getElementById('categoriesGrid');

      if (categoriesGrid) {
        categoriesGrid.innerHTML = ui.emptyState(
          '⚠️',
          'Error loading categories',
          error.message
        );
      }
    }
  },

  async showCategoryProducts(categoryId, categoryName) {
    const container = document.getElementById('screen-categories');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <button class="btn btn-ghost btn-sm" id="allCategoriesBtn"
          style="margin-bottom:8px;">← All Categories</button>
        <h1 class="page-title"></h1>
      </div>
      <div id="catProductsGrid">${ui.productGridSkeletons(8)}</div>
    `;

    container.querySelector('.page-title').textContent = categoryName;

    document.getElementById('allCategoriesBtn')?.addEventListener('click', () => {
      this.load();
    });

    try {
      const result = await api.categories.products(categoryId);
      const grid = document.getElementById('catProductsGrid');
      if (!grid) return;

      const products = result.content || [];

      if (products.length === 0) {
        grid.innerHTML = ui.emptyState(
          '📦',
          'No products',
          'No products in this category yet.'
        );
      } else {
        grid.innerHTML = `
          <div class="products-grid">
            ${products.map(product =>
              ui.productCard(product, appState.wishlistIds)
            ).join('')}
          </div>
        `;
      }
    } catch (error) {
      const grid = document.getElementById('catProductsGrid');

      if (grid) {
        grid.innerHTML = ui.emptyState('⚠️', 'Error', error.message);
      }
    }
  }
};


// Product Detail screen

const productDetailModule = {
  product: null,
  quantity: 1,

  async load(productId) {
    const container = document.getElementById('screen-product-detail');
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:300px;">
        <div class="spinner spinner-lg"></div>
      </div>
    `;

    try {
      const product = await api.products.get(productId);
      this.product = product;
      this.quantity = 1;
      this.render();
    } catch (error) {
      container.innerHTML = ui.emptyState(
        '⚠️',
        'Product not found',
        error.message,
        `<button class="btn btn-secondary" onclick="router.back()">Go Back</button>`
      );
    }
  },

  render() {
    const p = this.product;
    const container = document.getElementById('screen-product-detail');
    if (!container || !p) return;

    const inWishlist = appState.wishlistIds.has(p.id);
    const inStock = p.stock > 0;
    const discounted = p.discountedPrice ?? p.price;

    container.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="router.back()"
        style="margin-bottom:20px;">← Back</button>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:40px;align-items:start;">
        <div>
          <div style="aspect-ratio:1;border-radius:var(--radius-xl);overflow:hidden;background:var(--color-surface);border:1px solid var(--color-border);">
            <img
              src="${p.imageUrl || ''}"
              alt="${p.name || 'Product'}"
              style="width:100%;height:100%;object-fit:cover;"
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600';"
            >
          </div>
        </div>

        <div>
          ${p.category ? `
            <div style="color:var(--color-primary);font-size:0.8rem;font-weight:600;margin-bottom:8px;text-transform:uppercase;">
              ${p.category.name}
            </div>
          ` : ''}

          ${p.brand ? `
            <div style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:6px;">
              ${p.brand}
            </div>
          ` : ''}

          <h1 style="font-size:1.5rem;font-weight:700;margin:0 0 12px;">
            ${p.name}
          </h1>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            ${ui.stars(p.rating)}
            <span style="color:var(--color-text-secondary);font-size:0.875rem;">
              ${p.rating ?? 0} (${p.reviewCount ?? 0} reviews)
            </span>
          </div>

          <div class="price-display" style="margin-bottom:20px;">
            <span class="price-current">${ui.formatPrice(discounted)}</span>
            ${p.discountPercent > 0 ? `
              <span class="price-original" style="margin-left:12px;">
                ${ui.formatPrice(p.price)}
              </span>
              <span class="price-discount" style="margin-left:8px;">
                ${p.discountPercent}% off
              </span>
            ` : ''}
          </div>

          <div style="margin-bottom:20px;">
            ${inStock ? `
              <span style="color:var(--color-success);font-weight:600;">✓ In Stock</span>
              <span style="color:var(--color-text-muted);font-size:0.8rem;margin-left:8px;">
                (${p.stock} available)
              </span>
            ` : `
              <span style="color:var(--color-error);font-weight:600;">✗ Out of Stock</span>
            `}
          </div>

          ${p.description ? `
            <p style="color:var(--color-text-secondary);line-height:1.7;margin-bottom:24px;">
              ${p.description}
            </p>
          ` : ''}

          ${inStock ? `
            <div style="margin-bottom:20px;">
              <div class="form-label">Quantity</div>
              <div class="quantity-selector">
                <button class="qty-btn" id="qtyMinus"
                  onclick="productDetailModule.changeQty(-1)" ${this.quantity <= 1 ? 'disabled' : ''}>−</button>
                <span class="qty-value" id="qtyDisplay">${this.quantity}</span>
                <button class="qty-btn" id="qtyPlus"
                  onclick="productDetailModule.changeQty(1)" ${this.quantity >= p.stock ? 'disabled' : ''}>+</button>
              </div>
            </div>

            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button class="btn btn-secondary" id="detailWishlistBtn"
                onclick="wishlistModule.toggle(${p.id}, this)" style="flex:1;">
                ${inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
              </button>

              <button class="btn btn-primary" id="detailAddCartBtn"
                onclick="productDetailModule.addToCart()" style="flex:1;">
                Add to Cart
              </button>
            </div>

            <button class="btn btn-primary" id="detailBuyNowBtn"
              style="width:100%;margin-top:12px;background:var(--color-success);"
              onclick="productDetailModule.buyNow()">Buy Now</button>
          ` : `
            <button class="btn btn-secondary w-full" disabled>Out of Stock</button>
          `}
        </div>
      </div>
    `;
  },

  changeQty(delta) {
    const p = this.product;
    if (!p || p.stock <= 0) return;

    this.quantity = Math.max(1, Math.min(p.stock, this.quantity + delta));

    const display = document.getElementById('qtyDisplay');
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');

    if (display) display.textContent = this.quantity;
    if (minus) minus.disabled = this.quantity <= 1;
    if (plus) plus.disabled = this.quantity >= p.stock;
  },

  async addToCart() {
    if (!this.product) return;

    const btn = document.getElementById('detailAddCartBtn');
    await cartModule.addToCart(this.product.id, this.quantity, btn);
  },

  async buyNow() {
    if (!this.product) return;

    const btn = document.getElementById('detailBuyNowBtn');
    ui.setLoading(btn, true, 'Processing...');

    try {
      await api.cart.addItem(this.product.id, this.quantity);
      await appState.refreshCart();
      router.navigate('checkout');
    } catch (error) {
      ui.error(error.message);
    } finally {
      ui.setLoading(btn, false);
    }
  }
};


// Expose modules for inline handlers and router

window.searchModule = searchModule;
window.categoriesModule = categoriesModule;
window.productDetailModule = productDetailModule;
