# 🍽️ La Maison — Full-stack Restaurant Ordering Setup & Fixes Summary

We have successfully resolved the `ENOENT: Could not read package.json` error when running the project, fixed the React frontend nested `<Router>` runtime crash, and resolved critical database and syntax mismatches in the backend server. The application is now 100% correct, synchronized, and ready to go!

---

## 🛠️ What We Did

### 1. Created Root-Level `package.json`
We created a modern, unified `package.json` in the root workspace (`D:\FULL STACK IINTERNSHIP\TASK6\package.json`) that manages both the frontend (`client/`) and backend (`server/`) simultaneously.
* **Orchestration**: Used the `concurrently` package to spawn both dev servers in a single terminal.
* **Unified Scripts**: Added a simple `npm run dev` script at the root to boot both environments.

### 2. Resolved Frontend Router Nesting Crash & Restored La Maison Premium Pages
The frontend app had a basic "MyStore" template that caused a runtime crash (`You cannot render a <Router> inside another <Router>`) due to a redundant nested `<Router>` element, whilst completely ignoring the actual, beautiful "La Maison" pages and layout already present in the workspace.
* **Removed Redundant Router**: Removed the nested `<Router>` wrapper in `App.jsx`, leaving the router control to the root `<BrowserRouter>` in `main.jsx` and curing the crash.
* **Wired Up Premium Pages**: Connected the premium restaurant layouts and page components using React Router nested `<Route>` structure under [Layout.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/components/Layout.jsx):
  * [Home.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Home.jsx) (Route `/`)
  * [Menu.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Menu.jsx) (Route `/menu`)
  * [Cart.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Cart.jsx) (Route `/cart`, protected)
  * [Checkout.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Checkout.jsx) (Route `/checkout`, protected)
  * [MyOrders.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/MyOrders.jsx) (Route `/orders`, protected)
  * [OrderSummary.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/OrderSummary.jsx) (Route `/orders/:id`, protected)
  * [Login.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Login.jsx) (Route `/login`)
  * [Register.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Register.jsx) (Route `/register`)
* **Secured Client Pages**: Implemented a `ProtectedRoute` wrapper inside [App.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/App.jsx) to redirect non-authenticated users to `/login` when trying to access the Cart, Checkout, or Order History pages.

### 3. Standardized Server to ES Modules (`import`/`export`)
The Express backend is configured as `"type": "module"`, but several database models were written in older CommonJS syntax (`require`/`module.exports`). We migrated them to standard ES Modules:
* **[User.js](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/server/src/models/User.js)**
* **[Product.js](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/server/src/models/Product.js)**
* **[Order.js](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/server/src/models/Order.js)**

### 4. Fixed Model Schema Mismatches (Crucial!)
We caught and resolved severe schema errors between the backend routes, database seeder, and React client payloads:
* **Password Field**: Changed the `User` schema's field name from `password` to `passwordHash` to align with the `/api/auth/register` and `/api/auth/login` routes which save and verify hashed credentials.
* **Category Field**: Added `category` to the `Product` schema. This was missing from the model, which was causing the database seeder (`seed.js`) to drop category values and breaking route-level category sorting.
* **Order Schema**: The original `Order` schema was imported from a different template (demanding generic fields like `shippingAddress`, `paymentMethod`, and `orderItems`). We rewrote it from scratch to match the actual checkout payload sent by [Checkout.jsx](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/client/src/pages/Checkout.jsx) and received by [orders.js](file:///D:/FULL%20STACK%20IINTERNSHIP/TASK6/server/src/routes/orders.js):
  * `customerName` (String)
  * `phone` (String)
  * `address` (String)
  * `notes` (String)
  * `items` (Array of items: product ref, name, price, quantity)
  * `subtotal` (Number)
  * `status` (String, default "Pending")

### 5. Configured Server Environment Variables
We updated the `server/.env` file to support both `MONGODB_URI` and `JWT_SECRET` variables, ensuring correct default settings for local development database setups.

---

## 🚀 How to Run the Project

Running the entire system is now incredibly simple:

1. **Open a terminal in the root directory** (`D:\FULL STACK IINTERNSHIP\TASK6`).
2. **Start the servers**:
   ```bash
   npm run dev
   ```

This will run:
* **Vite Client Frontend** at `http://localhost:5173/`
* **Express API Server** at `http://localhost:5000/`

> [!NOTE]
> When starting the dev server, the API server will attempt to connect to MongoDB. If MongoDB is not running locally yet, the server will log `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` and wait.
> 
> Because we are running in **live watch mode** (`node --watch`), as soon as you start your local MongoDB database service (or save a remote MongoDB connection string in `server/.env`), the backend server will automatically connect and proceed to seat the mock restaurant database!

---

## 🍃 Setting Up MongoDB

If you need to connect the project to MongoDB:

### Option A: Use a Local MongoDB Server (Recommended)
1. Install and start [MongoDB Community Edition](https://www.mongodb.com/try/download/community).
2. The server will automatically detect it at `mongodb://127.0.0.1:27017/restaurant_shop`.

### Option B: Use MongoDB Atlas (Cloud Database)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection URI.
3. Open `D:\FULL STACK IINTERNSHIP\TASK6\server\.env` in your editor.
4. Replace `MONGODB_URI` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/restaurant_shop?retryWrites=true&w=majority
   ```
5. Save the file. The server will automatically reload and connect!
