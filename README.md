# ShopIndia — E-Commerce Platform

React + Node.js + MySQL e-commerce app built for learning CI/CD with GitHub Actions.

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18, Vite, React Router  |
| Backend  | Node.js, Express              |
| Database | MySQL                         |
| CI/CD    | GitHub Actions                |
| Deploy   | Vercel (frontend) + Render (backend) |

## Quick Start

### 1. Clone and set up the database

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-cicd.git
cd ecommerce-cicd

# Create MySQL database and tables
mysql -u root -p < server/config/schema.sql
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
npm install
npm run dev     # runs on http://localhost:5000
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev     # runs on http://localhost:5173
```

### 4. Run tests

```bash
# Backend tests
cd server && npm test

# Frontend tests + lint
cd client && npm run lint && npm test
```

## API Endpoints

| Method | Endpoint                  | Auth     | Description            |
|--------|---------------------------|----------|------------------------|
| POST   | /api/auth/register        | Public   | Create account         |
| POST   | /api/auth/login           | Public   | Login                  |
| GET    | /api/auth/me              | User     | Get profile            |
| GET    | /api/products             | Public   | List products          |
| GET    | /api/products/:id         | Public   | Single product         |
| GET    | /api/products/categories  | Public   | All categories         |
| POST   | /api/products             | Admin    | Create product         |
| PUT    | /api/products/:id         | Admin    | Update product         |
| DELETE | /api/products/:id         | Admin    | Delete product         |
| GET    | /api/cart                 | User     | Get cart               |
| POST   | /api/cart                 | User     | Add to cart            |
| PUT    | /api/cart/:id             | User     | Update quantity        |
| DELETE | /api/cart/:id             | User     | Remove item            |
| DELETE | /api/cart/clear           | User     | Clear cart             |
| POST   | /api/orders               | User     | Place order            |
| GET    | /api/orders/my            | User     | My orders              |
| GET    | /api/orders               | Admin    | All orders             |
| PUT    | /api/orders/:id/status    | Admin    | Update order status    |

## CI/CD Pipeline

Every push to `main` triggers:

1. **Server CI** — installs deps, runs Jest tests
2. **Client CI** — ESLint, Vitest tests, Vite build
3. **Deploy** (main only) — triggers Render webhook

See `.github/workflows/ci.yml` for the full pipeline.

## Project Structure

```
ecommerce/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Navbar, ProductCard
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/           # Home, Products, Cart, Orders, Auth
│   │   └── __tests__/       # Vitest component tests
│   └── vite.config.js
├── server/                  # Node.js backend (Express)
│   ├── config/              # db.js, schema.sql
│   ├── controllers/         # auth, products, cart, orders
│   ├── middleware/          # JWT auth
│   ├── routes/              # auth, products, cart, orders
│   ├── __tests__/           # Jest API tests
│   └── index.js
└── .github/workflows/ci.yml # GitHub Actions pipeline
```
