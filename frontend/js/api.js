
/* ShopVerse API Client */

const API_BASE = (
  window.SHOPVERSE_API_BASE ||
  (
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:8080/api'
      : `${window.location.origin}/api`
  )
).replace(/\/+$/, '');

const api = {
  getHeaders() {
    const token = localStorage.getItem('shopverse_token');
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  },

  async request(method, endpoint, body = null, requiresAuth = true) {
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (body !== null && body !== undefined) {
      options.body = JSON.stringify(body);
    }

    let response;

    try {
      response = await fetch(`${API_BASE}${endpoint}`, options);
    } catch (error) {
      console.error(`ShopVerse API network error: ${method} ${endpoint}`, error);

      if (error.name === 'TypeError') {
        throw new Error(
          `Cannot connect to the server at ${API_BASE}. Check that the backend is running.`
        );
      }

      throw error;
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    let responseText = '';

    if (response.status !== 204) {
      try {
        responseText = await response.text();

        if (responseText) {
          if (contentType.includes('application/json')) {
            try {
              data = JSON.parse(responseText);
            } catch {
              data = { message: responseText };
            }
          } else {
            data = { message: responseText };
          }
        }
      } catch (error) {
        console.error('Could not read API response:', error);
      }
    }

    if (response.status === 401) {
      localStorage.removeItem('shopverse_token');
      localStorage.removeItem('shopverse_user');

      if (requiresAuth) {
        const currentPath = window.location.pathname;
        const isLoginPage =
          currentPath.endsWith('/index.html') ||
          currentPath.endsWith('/');

        if (!isLoginPage) {
          window.location.href = 'index.html';
        }
      }

      throw new Error(
        data?.message || 'Your session has expired. Please log in again.'
      );
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.detail ||
        (typeof data === 'string' ? data : null) ||
        `Request failed with HTTP ${response.status}`;

      console.error('ShopVerse API error:', {
        method,
        endpoint,
        status: response.status,
        response: data
      });

      throw new Error(message);
    }

    return data;
  },

  get: (endpoint, requiresAuth = true) =>
    api.request('GET', endpoint, null, requiresAuth),

  post: (endpoint, body, requiresAuth = true) =>
    api.request('POST', endpoint, body, requiresAuth),

  put: (endpoint, body, requiresAuth = true) =>
    api.request('PUT', endpoint, body, requiresAuth),

  delete: (endpoint, requiresAuth = true) =>
    api.request('DELETE', endpoint, null, requiresAuth),

  auth: {
    login: (email, password) =>
      api.post('/auth/login', { email, password }, false),

    register: (name, email, password) =>
      api.post('/auth/register', { name, email, password }, false),

    forgotPassword: (email) =>
      api.post('/auth/forgot-password', { email }, false)
  },

  products: {
    list: (page = 0, size = 20) =>
      api.get(`/products?page=${page}&size=${size}`, false),

    get: id => api.get(`/products/${id}`, false),

    search: params => {
      const query = new URLSearchParams();

      if (params.q) query.set('q', params.q);
      if (params.categoryId) query.set('categoryId', params.categoryId);
      if (params.minPrice) query.set('minPrice', params.minPrice);
      if (params.maxPrice) query.set('maxPrice', params.maxPrice);
      if (params.minRating) query.set('minRating', params.minRating);
      if (params.sort) query.set('sort', params.sort);

      query.set('page', params.page ?? 0);
      query.set('size', params.size ?? 20);

      return api.get(`/products/search?${query.toString()}`, false);
    },

    featured: () => api.get('/products/featured', false),
    trending: () => api.get('/products/trending', false),
    newArrivals: () => api.get('/products/new-arrivals', false),
    recommended: () => api.get('/products/recommended')
  },

  categories: {
    list: () => api.get('/categories', false),
    get: id => api.get(`/categories/${id}`, false),

    products: (id, page = 0, size = 20) =>
      api.get(`/categories/${id}/products?page=${page}&size=${size}`, false)
  },

  cart: {
    get: () => api.get('/cart'),

    addItem: (productId, quantity) =>
      api.post('/cart/items', { productId, quantity }),

    updateItem: (itemId, quantity) =>
      api.put(`/cart/items/${itemId}`, { quantity }),

    removeItem: itemId =>
      api.delete(`/cart/items/${itemId}`)
  },

  wishlist: {
    get: () => api.get('/wishlist'),

    addItem: productId =>
      api.post('/wishlist/items', { productId }),

    removeItem: productId =>
      api.delete(`/wishlist/items/${productId}`),

    moveToCart: productId =>
      api.post(`/wishlist/items/${productId}/move-to-cart`, {})
  },

  addresses: {
    list: () => api.get('/addresses'),
    create: data => api.post('/addresses', data),
    update: (id, data) => api.put(`/addresses/${id}`, data),
    delete: id => api.delete(`/addresses/${id}`)
  },

  orders: {
    create: data => api.post('/orders', data),
    list: () => api.get('/orders'),
    get: id => api.get(`/orders/${id}`)
  },

  payments: {
    createOrder: orderId =>
      api.post('/payments/create-order', { orderId }),

    verify: data => api.post('/payments/verify', data)
  },

  user: {
    me: () => api.get('/users/me'),
    updateProfile: data => api.put('/users/me', data),
    changePassword: data => api.put('/users/me/password', data),
    settings: () => api.get('/users/me/settings'),
    updateSettings: data => api.put('/users/me/settings', data),
    interests: () => api.get('/users/me/interests'),

    saveInterests: categoryIds =>
      api.post('/users/me/interests', { categoryIds })
  },

  admin: {
    dashboard: () => api.get('/admin/dashboard'),

    products: {
      list: (page = 0, size = 20) =>
        api.get(`/admin/products?page=${page}&size=${size}`),

      create: data => api.post('/admin/products', data),
      update: (id, data) => api.put(`/admin/products/${id}`, data),
      delete: id => api.delete(`/admin/products/${id}`)
    },

    categories: {
      list: () => api.get('/admin/categories'),
      create: data => api.post('/admin/categories', data),
      update: (id, data) => api.put(`/admin/categories/${id}`, data),
      delete: id => api.delete(`/admin/categories/${id}`)
    },

    orders: {
      list: (page = 0, size = 20, status = '') =>
        api.get(
          `/admin/orders?page=${page}&size=${size}` +
          (status ? `&status=${encodeURIComponent(status)}` : '')
        ),

      get: id => api.get(`/admin/orders/${id}`),

      updateStatus: (id, status) =>
        api.put(`/admin/orders/${id}/status`, { status })
    },

    customers: {
      list: (page = 0, size = 20) =>
        api.get(`/admin/customers?page=${page}&size=${size}`)
    },

    payments: {
      list: (page = 0, size = 20) =>
        api.get(`/admin/payments?page=${page}&size=${size}`)
    }
  }
};

window.api = api;
