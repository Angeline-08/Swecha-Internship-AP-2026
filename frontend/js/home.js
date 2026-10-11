// Home Screen Module
const homeModule = {
  async load() {
    const container = document.getElementById('screen-home');
    if (!container) return;
    container.innerHTML = `
      <div class="hero" id="heroSection">
        <div class="hero__content">
          <div class="hero__tag">✨ New Collection 2024</div>
          <h1 class="hero__title">Shop Smarter.<br>Live Better.</h1>
          <p class="hero__subtitle">Discover thousands of products across all categories. Curated just for you.</p>
          <div class="hero__actions">
            <button class="btn btn-primary btn-lg" onclick="router.navigate('search')">Explore Now</button>
            <button class="btn btn-secondary btn-lg" onclick="router.navigate('categories')">Browse Categories</button>
          </div>
        </div>
        <div class="hero__visual">🛍️</div>
      </div>
      <div id="recommendedSection" class="section">
        <div class="section__header"><h2 class="section__title">⭐ Recommended for You</h2><a class="section__link" href="#" onclick="router.navigate('search')">See all</a></div>
        <div id="recommendedGrid">${ui.productGridSkeletons(4)}</div>
      </div>
      <div id="featuredSection" class="section">
        <div class="section__header"><h2 class="section__title">🔥 Featured Products</h2><a class="section__link" href="#" onclick="router.navigate('search')">See all</a></div>
        <div id="featuredGrid">${ui.productGridSkeletons(4)}</div>
      </div>
      <div id="trendingSection" class="section">
        <div class="section__header"><h2 class="section__title">📈 Trending</h2></div>
        <div id="trendingGrid">${ui.productGridSkeletons(4)}</div>
      </div>
      <div id="newArrivalsSection" class="section">
        <div class="section__header"><h2 class="section__title">🆕 New Arrivals</h2></div>
        <div id="newArrivalsGrid">${ui.productGridSkeletons(4)}</div>
      </div>
    `;

    // Load all sections in parallel
    const isLoggedIn = !!localStorage.getItem('shopverse_token');
    const promises = [
      api.products.featured(),
      api.products.trending(),
      api.products.newArrivals(),
      isLoggedIn ? api.products.recommended() : Promise.resolve(null),
    ];

    try {
      const [featured, trending, newArrivals, recommended] = await Promise.allSettled(promises);
      
      const wishlistIds = appState.wishlistIds;
      
      if (featured.status === 'fulfilled') {
        document.getElementById('featuredGrid').innerHTML = this.renderProductList(featured.value, wishlistIds);
      }
      if (trending.status === 'fulfilled') {
        document.getElementById('trendingGrid').innerHTML = this.renderProductList(trending.value, wishlistIds);
      }
      if (newArrivals.status === 'fulfilled') {
        document.getElementById('newArrivalsGrid').innerHTML = this.renderProductList(newArrivals.value, wishlistIds);
      }
      if (recommended.status === 'fulfilled' && recommended.value) {
        document.getElementById('recommendedGrid').innerHTML = this.renderProductList(recommended.value, wishlistIds);
      } else {
        // Hide recommended section if not logged in or no interests
        document.getElementById('recommendedSection').style.display = 'none';
      }
    } catch (e) {
      console.error('Error loading home:', e);
    }
  },

  renderProductList(products, wishlistIds) {
    if (!products || products.length === 0) return ui.emptyState('📦', 'No products', 'Check back soon!');
    return `<div class="products-grid">${products.map(p => ui.productCard(p, wishlistIds)).join('')}</div>`;
  },
};

window.homeModule = homeModule;
