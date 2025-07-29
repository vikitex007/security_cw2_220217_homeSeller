# HomeSell Pro Setup Guide

## 🔧 Environment Configuration

### 1. Create Environment File
Create a `.env` file in the root directory with the following variables:

```env
MONGO=mongodb://localhost:27017/homesell
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Update the `MONGO` variable with your connection string
- Example: `mongodb://localhost:27017/homesell`

### 3. JWT Secret
- Generate a secure random string for JWT_SECRET
- Example: `JWT_SECRET=my_super_secret_key_123456789`

### 4. Stripe Configuration (Optional for Payment Features)

#### Get Stripe Test Keys:
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Dashboard → Developers → API Keys
3. Copy your test keys:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`

#### Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
npm install
cd client && npm install
```

### 2. Start the Application
```bash
npm run dev
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🔒 MFA Setup

### 1. Enable MFA for Testing:
1. Sign up/login to the application
2. Go to Profile → Security (MFA)
3. Click "Setup MFA"
4. Scan QR code with Google Authenticator or Authy
5. Enter the 6-digit code to enable MFA

### 2. Test MFA Login:
1. Sign out and try to sign in
2. Enter your email/password
3. Enter the MFA code from your authenticator app
4. You should be logged in successfully

## 💳 Payment Testing

### 1. Without Stripe (Development):
- Payment features will show "not configured" message
- All other features work normally

### 2. With Stripe (Production):
1. Configure Stripe keys in `.env`
2. Create a listing
3. Click "Make Payment" on any listing
4. Use test card numbers to test payments

## 🐛 Troubleshooting

### MFA Issues:
- **"User not found"**: Fixed - was using wrong user ID field
- **Invalid token**: Make sure to use the current code from your authenticator app
- **QR code not working**: Try manual entry of the secret key

### Payment Issues:
- **Stripe not configured**: Add Stripe keys to `.env` file
- **Payment failed**: Use valid test card numbers
- **API key error**: Check your Stripe secret key format

### Database Issues:
- **Connection failed**: Check MongoDB connection string
- **User not found**: Ensure MongoDB is running

## 📝 Testing Checklist

### ✅ Basic Features:
- [ ] User registration
- [ ] User login
- [ ] Profile updates
- [ ] Listing creation
- [ ] Listing search

### ✅ Security Features:
- [ ] MFA setup and enable
- [ ] MFA login flow
- [ ] Brute force protection (try 5 failed logins)
- [ ] Activity logging

### ✅ Payment Features (with Stripe):
- [ ] Payment intent creation
- [ ] Payment completion
- [ ] Transaction history
- [ ] Activity logs for payments

## 🔧 Development Notes

### MFA Implementation:
- Uses `speakeasy` for TOTP generation
- Compatible with Google Authenticator, Authy, etc.
- Backup codes for account recovery
- QR code generation for easy setup

### Payment Implementation:
- Stripe integration for secure payments
- PCI compliant through Stripe
- Transaction logging and history
- Refund processing capabilities

### Activity Logging:
- Comprehensive user action tracking
- Security event monitoring
- Export functionality (JSON/CSV)
- IP address and user agent logging

## 🆘 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check network connectivity for external services

For MFA issues specifically:
- Ensure the time on your device is accurate
- Try using backup codes if available
- Check that the authenticator app is working correctly 