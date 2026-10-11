# ShopVerse audit notes

## Fixes applied in this audit

- Removed `js/auth.js` from `app.html`. That script belongs to the sign-in page; when loaded in the authenticated app it could redirect/reload the customer app repeatedly.
- Aligned app-shell selectors with the actual HTML IDs: `globalSearch` and `mobileMenuBtn`.
- Wired the avatar dropdown to the actual `userAvatar` element and made it keyboard-accessible.
- Wired both sidebar and dropdown logout buttons (`logoutBtn` and `dropdownLogoutBtn`).
- Updated cart badge refresh to include the topbar cart count.
- Wired dropdown profile/settings links to the app router and made the admin-only links visible for an ADMIN user.

## Validation performed

- Every frontend JavaScript file passed `node --check` (syntax validation).
- Local CSS/JS paths referenced by `index.html`, `app.html`, and `admin.html` were checked; none were missing.
- Frontend API route names were compared against the Spring controller mappings for the main API resources.

## Still needs a live run with your configuration

- Maven/Spring Boot build and application startup were not run in this audit environment.
- Confirm the local MySQL username/password in `backend/src/main/resources/application.properties` or environment variables.
- Google OAuth requires valid Google client credentials and matching redirect URLs. The current `SecurityConfig.java` still redirects OAuth success/failure to `http://localhost:3000`; update this for the actual frontend URL before relying on Google sign-in/deployment.
- Razorpay requires valid test/live credentials. Placeholder credentials do not process real payments.
- Test registration/login, onboarding, search, cart, checkout, orders, admin CRUD, and logout in the browser before submission.
