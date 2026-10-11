# ShopVerse 🛒

> **Shop Smarter. Live Better.**

A modern, full-stack e-commerce platform built with Spring Boot, MySQL, and Vanilla JavaScript.

---

## ✨ Features

### Customer Experience
- 🔐 JWT Authentication (Login, Register, Google OAuth)
- 🎯 Personalized onboarding with interest selection
- 🏠 Dynamic home with recommended, featured, trending products
- 🔍 Full-text product search with filters (category, price, rating)
- 🛍️ Product detail with quantity selector and stock tracking
- 🛒 Real-time cart with quantity updates and totals
- ❤️ Wishlist with move-to-cart functionality
- 📦 Multi-address management
- 💳 Razorpay online payment (secure, server-verified)
- 💵 Cash on Delivery
- 📋 Order history and detailed order tracking
- 👤 Profile management, password change
- ⚙️ Settings: Dark/Light/System theme, notifications, personalization

### Admin Panel
- 📊 Dashboard with revenue, order counts, customer stats
- 📦 Full product CRUD (create, edit, soft-delete)
- 🏷️ Category management with product count protection
- 🛒 Order management with status updates
- 👥 Customer directory
- 💳 Payment records (Razorpay + COD)

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JavaScript (SPA)  |
| Backend     | Java 17, Spring Boot 3.2, Maven        |
| Database    | MySQL 8 via Spring Data JPA/Hibernate  |
| Security    | Spring Security, JWT, BCrypt           |
| OAuth       | Google OAuth2 (Spring Security OAuth2) |
| Payments    | Razorpay                               |
| Deployment  | Railway (backend + MySQL)              |

---

## 🏗️ Architecture

```
User → Frontend (Vanilla JS SPA)
           ↓ REST API (fetch)
      Spring Boot Backend
           ↓
      Service Layer
           ↓
      JPA / Hibernate
           ↓
        MySQL 8

External:
Backend → Razorpay API
Backend → Google OAuth2
```

---

## 📂 Project Structure

```
shopverse/
├── backend/                    ← Spring Boot Maven project
│   ├── src/main/java/com/shopverse/
│   │   ├── config/             ← SecurityConfig, CorsConfig, RazorpayConfig
│   │   ├── controller/         ← REST controllers
│   │   ├── dto/                ← Request/Response DTOs
│   │   ├── entity/             ← JPA entities + enums
│   │   ├── exception/          ← GlobalExceptionHandler, custom exceptions
│   │   ├── init/               ← DataInitializer (seed data)
│   │   ├── repository/         ← JpaRepository interfaces
│   │   ├── security/           ← JWT, OAuth2, UserDetailsService
│   │   └── service/            ← Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── railway.toml
├── frontend/                   ← Vanilla JS SPA
│   ├── index.html              ← Auth screen
│   ├── app.html                ← Customer SPA
│   ├── admin.html              ← Admin panel
│   ├── css/                    ← Theme, components, layout, responsive
│   └── js/                     ← Modular JavaScript
├── docker-compose.yml          ← MySQL + Backend containers
├── .env.example                ← Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker Desktop (for MySQL via Docker Compose)
- Any HTTP server for frontend (VS Code Live Server, `npx serve`, etc.)

---

### Step 1: Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/shopverse.git
cd shopverse
```

---

### Step 2: Start MySQL

```bash
# Start only MySQL (not the full backend container)
docker-compose up -d mysql

# Verify MySQL is running
docker-compose ps
```

MySQL will be available at `localhost:3306` with database `shopverse`, user `shopverse_user`, password `shopverse_pass`.

**Alternative**: If you have a local MySQL installation, create the database manually:
```sql
CREATE DATABASE shopverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shopverse_user'@'localhost' IDENTIFIED BY 'shopverse_pass';
GRANT ALL PRIVILEGES ON shopverse.* TO 'shopverse_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Step 3: Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET_HERE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

For the backend, you can either:

**Option A: Use environment variables directly** (set them in your shell/IDE)

**Option B: Create `application-local.properties`** in `backend/src/main/resources/`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/shopverse?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=shopverse_user
spring.datasource.password=shopverse_pass
jwt.secret=your-local-jwt-secret-at-least-32-chars
razorpay.key.id=rzp_test_YOUR_KEY
razorpay.key.secret=YOUR_SECRET
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-secret
```

> ⚠️ `application-local.properties` is in `.gitignore` — it will never be committed.

---

### Step 4: Build and run the backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/shopverse-backend-1.0.0.jar
```

Or run with local profile:
```bash
java -Dspring.profiles.active=local -jar target/shopverse-backend-1.0.0.jar
```

Or run directly from Maven:
```bash
mvn spring-boot:run
```

The backend will start at **http://localhost:8080**

On first startup, the DataInitializer will create:
- 8 categories
- 21 products  
- Admin user: `admin@shopverse.com` / `Admin@123`
- Sample customer: `customer@shopverse.com` / `Customer@123`

---

### Step 5: Serve the frontend

**Option A: VS Code Live Server**
Right-click `frontend/index.html` → Open with Live Server

**Option B: npx serve**
```bash
cd frontend
npx serve .
```
Then open http://localhost:3000

**Option C: Python**
```bash
cd frontend
python -m http.server 3000
```

---

## 💳 Razorpay Test Setup

1. Create a free Razorpay account at https://razorpay.com
2. Go to Dashboard → Settings → API Keys → Generate Test Key
3. Copy your `Key ID` and `Key Secret`
4. Add them to your environment variables / `application-local.properties`

**Test card details (Razorpay test mode):**
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `1234`

**Test UPI:** `success@razorpay`

---

## 🔐 Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Google+ API" and "Google Identity"
4. Go to "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback`
   - (Add your Railway URL for production)
7. Copy the Client ID and Client Secret to your config

---

## 🌍 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL JDBC URL | ✅ |
| `DATABASE_USERNAME` | MySQL username | ✅ |
| `DATABASE_PASSWORD` | MySQL password | ✅ |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `JWT_EXPIRATION` | JWT expiry in ms (default: 86400000 = 24h) | ❌ |
| `RAZORPAY_KEY_ID` | Razorpay test/live Key ID | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay test/live Key Secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | ❌ |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | ❌ |

---

## 🚂 Railway Deployment

### Deploy Backend

1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select the `shopverse` repo
4. Set **Root Directory** to `backend/`
5. Railway will auto-detect the Dockerfile
6. Add all environment variables in Railway's Variables tab
7. Add a MySQL plugin: `New` → `Database` → `MySQL`
8. Railway provides `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` automatically

### Deploy Frontend

Options:
- **Vercel**: `vercel --prod` from the `frontend/` directory
- **Netlify**: Drag and drop the `frontend/` folder
- **Railway Static**: Add a second service with the `frontend/` directory

Update `CORS_ALLOWED_ORIGINS` in the backend to include your frontend's production URL.

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopverse.com | Admin@123 |
| Customer | customer@shopverse.com | Customer@123 |

---

## 📡 API Documentation

Base URL: `http://localhost:8080/api`

See [API_SPEC.md](./API_SPEC.md) for full endpoint documentation.

Key endpoints:
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login, get JWT
- `GET /api/products` — Browse products
- `GET /api/products/search?q=headphones` — Search
- `GET /api/cart` — View cart (auth required)
- `POST /api/orders` — Place order (auth required)
- `GET /api/admin/dashboard` — Admin stats (ADMIN role)

---

## 🔒 Security Notes

- Passwords hashed with BCrypt
- JWTs signed with HS256
- Admin endpoints protected by Spring Security roles
- Order totals computed server-side (never trust client)
- Razorpay payments verified server-side via HMAC-SHA256
- No secrets in source code — all via environment variables

---

## 📝 License

MIT — feel free to use, modify, and deploy.

---

Built with ❤️ using Spring Boot + Vanilla JS
