# 🚀 Hosting your Full-Stack Application on Vercel

This guide provides a step-by-step walkthrough to deploy your full-stack **La Maison** application on Vercel with a secure, connected **MongoDB Atlas** database.

---

## 🛠️ Prerequisites

Before you deploy, make sure you have:
1. A **GitHub** account.
2. A **Vercel** account (connected to your GitHub account).
3. A **MongoDB Atlas** account with a cluster already created.

---

## 📂 Code Changes Already Implemented

To ensure a seamless deployment on Vercel, the following architectural fixes have already been implemented in your codebase:
1. **Relative API Base URL**: Updated `client/src/api/client.js` to use a relative base URL (`/api`). Vercel serves both your React frontend and your Express API on the same domain, so this eliminates hardcoded localhost URLs.
2. **Cold Start Safe Seeding**: Modified `server/src/seed.js` to check if products exist (`Product.countDocuments()`) before seeding. This prevents Vercel serverless cold starts from wiping and re-seeding your database repeatedly.
3. **Root Dependency Resolution**: Lifted backend dependencies (like `express`, `mongoose`, `cors`) into the root `package.json` so that Vercel can successfully resolve and install them when building your serverless `api/index.js` entrypoint.

---

## Schritt 1: Configure MongoDB Atlas IP Access List (CRITICAL)

Because Vercel serverless functions run on dynamic cloud IP addresses that change constantly, you cannot whitelist a specific IP address for Vercel. Instead, you must allow access from anywhere.

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left navigation sidebar under **Security**, select **Network Access**.
3. Click the **Add IP Address** button.
4. Select **Allow Access From Anywhere** (this will add `0.0.0.0/0` to your whitelist).
5. Click **Confirm**.
6. Under **Database Access** (also under Security), ensure you have created a database user with read and write permissions (e.g., `amanjc81_db_user`), and copy your connection string:
   ```env
   mongodb+srv://<username>:<password>@cluster0lm.sub17tf.mongodb.net/restaurant_shop?retryWrites=true&w=majority
   ```

---

## Schritt 2: Push your Code to GitHub

1. Create a new repository on your GitHub account (e.g., `La-Mansion`).
2. Open a terminal in your workspace folder (`d:\FULL STACK IINTERNSHIP\TASK6`) and commit/push your code:
   ```bash
   git init
   git add .
   git commit -m "Configure codebase for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/La-Mansion.git
   git push -u origin main
   ```

---

## Schritt 3: Deploy on Vercel Dashboard

1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click the **Add New...** button and select **Project**.
3. Find your `La-Mansion` repository in the list and click **Import**.
4. In the **Configure Project** window:
   * **Framework Preset**: Vercel will automatically detect Vite/React. Keep it as default.
   * **Root Directory**: Leave it as `./` (do not change it, Vercel will read the `vercel.json` file at the root).
5. Expand the **Environment Variables** section and add the following two keys:

| Name | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://amanjc81_db_user:YOUR_PASSWORD@cluster0lm.sub17tf.mongodb.net/restaurant_shop?retryWrites=true&w=majority` | Your actual MongoDB Atlas connection string with password replaced. |
| `JWT_SECRET` | `your-long-secure-random-secret-string` | A secure random string used to sign JWT authentications. |

6. Click **Deploy**.

Vercel will build your static React assets and bundle your Express API server into serverless functions in about 1–2 minutes. Once finished, you will receive a custom production URL (e.g., `https://la-mansion.vercel.app`)!
