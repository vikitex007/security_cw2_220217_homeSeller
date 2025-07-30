# Home Seller Pro

A real estate platform for buying and selling properties.

## Basic Features

- **User Authentication** - Sign up, sign in, and profile management
- **Property Listings** - Create, view, edit, and delete property listings
- **Search & Filter** - Find properties by location, price, and features
- **Admin Panel** - Manage users and view activity logs
- **Email Verification** - Secure account verification
- **MFA Support** - Two-factor authentication
- **Session Management** - Automatic logout after inactivity
- **CSRF Protection** - Cross-Site Request Forgery protection

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Set up environment variables:**
   Create `.env` file in root directory with:
   ```
   MONGO=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

3. **Run the application:**
   ```bash
   # Backend (Terminal 1)
   npm start
   
   # Frontend (Terminal 2)
   npm run dev
   ```

