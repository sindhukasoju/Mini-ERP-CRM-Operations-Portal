# Mini ERP + CRM Operations Portal

A full-stack Node.js + React application built for managing Customers (CRM), Products (Inventory), and Sales Challans for a wholesale/distribution company.

## 🏗 Architecture
This project is built using a modern full-stack architecture:
- **Backend**: Node.js with Express.js (TypeScript). Provides strict RESTful APIs with Role-Based Access Control (RBAC).
- **Database**: SQLite (via Prisma ORM). SQLite is used for seamless local development, but Prisma easily allows switching to PostgreSQL by changing the provider in `schema.prisma`.
- **Frontend**: React.js with Vite (TypeScript). Implements a clean, premium "glassmorphism" UI using pure vanilla CSS. Includes client-side routing and token-based API authentication via Axios interceptors.
- **Security**: JWT for stateless session management, bcrypt for password hashing.

## 🚀 Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The database is pre-seeded with test users. To start the server:
   ```bash
   npm run dev
   ```
   *The backend runs on `http://localhost:5000`*

### 2. Frontend Setup
1. Open a **new** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:5173`*

## 🔑 Test Credentials
The database has been pre-seeded with the following roles. All passwords are **`password123`**:
- **Admin**: `admin@fundsroom.com` (Full Access)
- **Sales**: `sales@fundsroom.com` (Customers, Challans)
- **Warehouse**: `warehouse@fundsroom.com` (Products, Stock)
- **Accounts**: `accounts@fundsroom.com` (View Access)

## 📦 Core Business Logic Handled
- **Stock Decrements**: Creating a "Draft" challan reserves no stock. When the challan is "Confirmed", a database transaction safely decrements the product stock.
- **Negative Stock Prevention**: The backend throws an explicit error if a user attempts to confirm a challan that exceeds available stock.
- **Snapshot Data**: Sales Challans store the price, name, and SKU of the product *at the time of creation*, ensuring historical data isn't corrupted if a product price changes later.

## 🌐 Deployment (AWS / Cloud)
If you wish to deploy this project:
1. **Database**: Provision a PostgreSQL instance on Neon or AWS RDS. Update the `DATABASE_URL` in `.env` and run `npx prisma migrate deploy`.
2. **Backend**: Deploy the Node.js backend using a service like Render or AWS Elastic Beanstalk. Ensure the `JWT_SECRET` and `DATABASE_URL` environment variables are securely set.
3. **Frontend**: Update the `baseURL` in `src/lib/api.ts` to point to your deployed backend URL. Build the React app (`npm run build`) and deploy the `dist` folder to Vercel, Netlify, or AWS S3 + CloudFront.

## ⚠️ Known Limitations
- Pagination and complex filtering (like date-range filters) on tables are mocked or handled client-side for simplicity.
- The UI uses absolute minimal dependencies, meaning complex components like searchable multi-select dropdowns for creating a Challan are implemented using basic HTML selects.
- Exporting invoices to PDF is not yet implemented.
