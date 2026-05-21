# Complete Indian Food eCommerce Platform Report

Prepared by a Passionate Developer

## 1. Introduction and Overview
This project is a complete full stack food ordering platform built using React for the frontend, Node.js and Express for the server, and MongoDB for data storage. The application is designed to simulate a premium Indian restaurant storefront where users can browse, search, and buy food items. It features a complete database integration, dynamic cart, secure logins, and a hidden admin workspace.

## 2. Platform Architecture and System Flow
The platform operates on a three tier architecture:

1. Frontend Layer (React Client)
The client application runs inside the user browser. It uses the React Router package for page routing and Axios to send secure HTTP requests to our server. All state management like cart items and auth session is handled locally in React contexts.

2. Backend Layer (Express API Server)
The server acts as the controller. It receives API calls, verifies credentials using JSON Web Token security, processes orders, and reads or writes data in the database.

3. Database Layer (MongoDB Atlas)
A secure MongoDB cluster stores all our dynamic data. This includes user account details, product information, active shopping carts, and completed order receipts.

System Interaction Flow:
🌟 User Login: The React client sends user credentials to the API server. The server verifies the password against a secure database record using bcrypt hashing. If correct, the server generates a JSON Web Token and sends it back to the client. The client stores this token in browser memory to authenticate all subsequent requests.
🌟 Browsing Menu: The Menu page fetches the complete food list from MongoDB. Users can filter dishes between Veg and Non Veg or browse category sections.
🌟 Cart Management: Adding a dish updates the user active cart in the database in real time. This ensures that their selected items are never lost, even if they log out or reload the browser.
🌟 Order Placement: During checkout, the client sends delivery address and contact details. The backend compiles the cart items, creates an order receipt, saves it to MongoDB, and empties the cart.

## 3. Core Database Schemas
Our Mongoose models define how data is structured in MongoDB:

1. User Schema
Stores names, emails, securely hashed passwords, and an isAdmin flag to identify administrators.

2. Product Schema
Defines name, description, price in Indian Rupees, category name, vegetarian flag, and the image path.

3. Cart Schema
Tracks which user owns the cart and contains an array of items with quantities and references to the product ID.

4. Order Schema
Saves the completed purchase details including total price, delivery address, phone, customized notes, and the current status like Pending or Delivered.

## 4. Key Implementation Features

1. Fully Dynamic Storefront
Features 40 premium Indian dishes sorted beautifully in Indian Rupees. It is styled with a gorgeous dark glassmorphic design and smooth scale hover transitions on card images.

2. Secure Role System
Admins are protected by backend route checks. If a normal user attempts to visit the admin panel, a custom shield screen block is shown with an option to elevate the account for testing.

3. Static Public Image Uploads
Admins can upload local images from their computer folders. The backend saves them directly inside the client public folder and stores a relative path in the database. This guarantees that your images will never disappear and will remain fully visible when you host the code on platforms like Vercel.

## 5. Insights and Conclusion
Building this project provided deep hands on experience with full stack development. Solving issues like CORS, token authentication, and image file paths was highly rewarding. By using relative static folders for user uploads, we built a fully portable app that is ready for deployment. The platform completely covers all guidelines and presents a professional, responsive eCommerce solution.
