# HomeSell Pro - Enhanced Real Estate Platform

A comprehensive real estate platform with advanced security features, payment processing, and activity logging.

## 🚀 Features Implemented

### ✅ 1. User-Centric Design
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Intuitive Navigation**: Easy-to-use interface with clear navigation paths
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### ✅ 2. User Registration and Authentication
- **Secure Registration**: Email and password-based registration
- **Multi-Factor Authentication (MFA)**: 
  - TOTP-based authentication using authenticator apps
  - QR code setup for easy configuration
  - Backup codes for account recovery
  - Enable/disable MFA from user profile
- **Brute Force Protection**: 
  - Account lockout after 5 failed login attempts
  - 15-minute lockout period
  - Automatic reset on successful login
- **Google OAuth**: Social login integration
- **JWT Token Authentication**: Secure session management

### ✅ 3. Customizable User Profiles
- **Profile Management**: Update username, email, and password
- **Avatar Upload**: Profile picture upload via Firebase Storage
- **Account Settings**: Comprehensive user settings management
- **Profile Security**: Secure profile updates with validation

### ✅ 4. Secure Transaction Processing
- **Stripe Integration**: Secure payment processing
- **Payment Intent Creation**: Server-side payment intent generation
- **Transaction History**: Complete payment history tracking
- **Refund Processing**: Automated refund handling
- **Payment Security**: SSL encryption and PCI compliance
- **Transaction Logging**: Detailed payment activity logs

### ✅ 5. Activity Logging
- **Comprehensive Logging**: All user actions are logged
- **Security Events**: High-priority security event tracking
- **Login History**: Detailed login attempt logging
- **Transaction Logs**: Payment activity monitoring
- **Export Functionality**: JSON and CSV export capabilities
- **Audit Trail**: Complete audit trail for compliance

## 🛠️ Technical Implementation

### Backend Features
- **MFA Implementation**: Using `speakeasy` for TOTP generation
- **Brute Force Protection**: Custom middleware for login attempt tracking
- **Activity Logging**: MongoDB-based activity tracking system
- **Payment Processing**: Stripe integration with webhook support
- **Security Middleware**: Rate limiting and IP tracking

### Frontend Features
- **MFA Setup UI**: QR code generation and verification
- **Payment Forms**: Secure payment processing interface
- **Activity Dashboard**: Real-time activity monitoring
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-first approach

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Home_Seller
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGO=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### MFA Setup
1. Navigate to Profile → Security (MFA)
2. Click "Setup MFA"
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes securely

### Payment Processing
1. Configure Stripe keys in environment variables
2. Set up webhook endpoints for payment events
3. Configure payment methods in Stripe dashboard

### Activity Logging
- Logs are automatically created for all user actions
- Access logs via Profile → Activity Logs
- Export logs in JSON or CSV format

## 🔒 Security Features

### Multi-Factor Authentication
- **TOTP Support**: Compatible with Google Authenticator, Authy, etc.
- **Backup Codes**: 8-digit backup codes for account recovery
- **Secure Setup**: Server-side secret generation
- **Verification**: Real-time token validation

### Brute Force Protection
- **Attempt Tracking**: Failed login attempt counting
- **Account Lockout**: Automatic lockout after 5 failed attempts
- **Time-based Reset**: 15-minute lockout period
- **IP Tracking**: IP address logging for security analysis

### Payment Security
- **SSL Encryption**: All payment data encrypted in transit
- **PCI Compliance**: Stripe handles PCI compliance
- **Token-based**: No sensitive data stored on servers
- **Webhook Verification**: Secure payment confirmation

## 📊 Activity Logging

### Logged Events
- User registration and login attempts
- Profile updates and changes
- Payment transactions and refunds
- MFA setup and configuration
- Security events and failures

### Log Details
- **Timestamp**: Precise event timing
- **User ID**: User identification
- **Action**: Specific action performed
- **IP Address**: Client IP for security
- **User Agent**: Browser/device information
- **Severity**: Low, Medium, High, Critical
- **Status**: Success, Failure, Warning

### Export Options
- **JSON Export**: Complete log data in JSON format
- **CSV Export**: Spreadsheet-compatible format
- **Date Filtering**: Export logs for specific date ranges
- **Event Filtering**: Filter by event type or severity

## 🎯 Usage Examples

### Setting up MFA
```javascript
// User navigates to Profile → Security (MFA)
// Clicks "Setup MFA"
// Scans QR code with authenticator app
// Enters 6-digit code for verification
// MFA is now enabled
```

### Making a Payment
```javascript
// User views property listing
// Clicks "Make Payment" button
// Enters payment amount
// Completes payment through Stripe
// Transaction is logged and confirmed
```

### Viewing Activity Logs
```javascript
// User navigates to Profile → Activity Logs
// Views recent activity
// Filters by event type
// Exports logs in desired format
```

## 🚀 Deployment

### Environment Variables
```env
MONGO=mongodb://localhost:27017/homesell
JWT_SECRET=your_secure_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Production Considerations
- Use HTTPS in production
- Configure proper CORS settings
- Set up monitoring and alerting
- Implement rate limiting
- Configure backup strategies

## 📈 Monitoring and Analytics

### Security Monitoring
- Failed login attempt tracking
- MFA usage statistics
- Payment failure analysis
- Suspicious activity detection

### User Analytics
- User registration trends
- Payment conversion rates
- Feature usage statistics
- Performance metrics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/mfa/setup` - MFA setup
- `POST /api/auth/mfa/enable` - Enable MFA
- `POST /api/auth/mfa/disable` - Disable MFA

### Payments
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/transactions` - Get transaction history
- `POST /api/payment/refund` - Process refund

### Activity Logs
- `GET /api/activity/logs` - Get user activity logs
- `GET /api/activity/security` - Get security events
- `GET /api/activity/login-history` - Get login history
- `GET /api/activity/export` - Export logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This application now includes all the requested features with enterprise-grade security, comprehensive logging, and secure payment processing capabilities. 