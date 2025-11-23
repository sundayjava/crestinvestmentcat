# Investment Platform - Complete Setup Guide

## 🎉 Project Status: COMPLETE

All features have been implemented including:
- ✅ Landing page
- ✅ Authentication system (register, login, OTP verification)
- ✅ User dashboard with real-time analytics
- ✅ Investment flow
- ✅ Withdrawal system
- ✅ Admin dashboard
- ✅ Admin user management
- ✅ Admin transaction management
- ✅ Admin asset management

## 🚀 Quick Start

### 1. Database Setup

```bash
# Initialize Prisma and create database
npx prisma generate
npx prisma db push

# Seed the database with sample data
npx prisma db seed
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/investment_db"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@investmentplatform.com"

# WhatsApp Notifications (optional)
WHATSAPP_API_URL="https://your-whatsapp-api.com"
WHATSAPP_API_KEY="your-whatsapp-api-key"
ADMIN_WHATSAPP_NUMBER="+1234567890"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

## 📋 Default Accounts (After Seeding)

### Admin Account
- Email: `admin@investment.com`
- Password: `admin123`
- Access: Full platform control

### Test User Account
- Email: `john@example.com`
- Password: `password123`
- Access: User features only

## 🌐 Page Structure

### Public Pages
- `/` - Landing page with features, assets showcase, and call-to-action

### Authentication Pages
- `/auth/register` - User registration with optional Dime Bank account
- `/auth/login` - User login
- `/auth/verify-otp` - Email verification via OTP

### User Dashboard Pages
- `/dashboard` - Main dashboard with portfolio overview and analytics
- `/dashboard/invest` - Investment flow (select asset, deposit, confirm)
- `/dashboard/withdraw` - Withdrawal request to Dime Bank account

### Admin Dashboard Pages
- `/admin` - Admin overview with platform statistics
- `/admin/users` - User management (balance manipulation, Dime account creation)
- `/admin/transactions` - Investment and withdrawal approval
- `/admin/assets` - Asset price management and market trends

## 🔧 Key Features

### User Features
1. **Registration & Login**
   - Email/password authentication
   - OTP email verification
   - Optional Dime Bank account during registration

2. **Investment Flow**
   - Browse available assets (Gold, Silver, Bitcoin, Real Estate)
   - Select investment amount
   - View deposit details
   - Submit payment proof
   - Receive investment receipt via email

3. **Dashboard**
   - Real-time portfolio value
   - Investment performance charts
   - Asset distribution visualization
   - Active investments tracking

4. **Withdrawals**
   - Request withdrawal to Dime Bank account
   - Automatic admin notification
   - Email confirmation on completion

### Admin Features
1. **User Management**
   - View all users
   - Search and filter users
   - Balance manipulation (SET/INCREASE/DECREASE)
   - Create Dime Bank accounts for users

2. **Transaction Management**
   - Approve/reject pending investments
   - Process withdrawal requests
   - View transaction history
   - Send receipts via email

3. **Asset Management**
   - Update asset prices in real-time
   - Monitor price trends
   - View investment distribution
   - Track active investments per asset

4. **Analytics**
   - Platform-wide statistics
   - User growth metrics
   - Transaction volume tracking
   - Real-time activity feed

## 📧 Email Notifications

The system sends automated emails for:
- OTP verification codes
- Investment receipts
- Withdrawal confirmations
- Dime Bank account details

## 📱 WhatsApp Notifications

Admins receive WhatsApp notifications for:
- New investment submissions
- New withdrawal requests
- User registrations (optional)

## 🎨 Design Features

- Modern gradient-based UI with purple/blue color scheme
- Fully responsive design (mobile, tablet, desktop)
- Real-time data updates
- Interactive charts and analytics
- Professional component library (shadcn/ui)

## 🔐 Security Features

- Password hashing with bcryptjs
- OTP-based email verification
- Role-based access control (USER/ADMIN)
- Secure API endpoints
- Input validation with Yup schemas

## 📊 Database Models

The platform uses 8 Prisma models:
1. **User** - User accounts and authentication
2. **Asset** - Investment assets (Gold, Bitcoin, etc.)
3. **Investment** - User investments and transactions
4. **Transaction** - Transaction history
5. **Withdrawal** - Withdrawal requests
6. **OTP** - Email verification codes
7. **Notification** - System notifications
8. **SystemSettings** - Platform configuration

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + shadcn/ui patterns
- **Forms**: React Hook Form + Yup validation
- **State Management**: Zustand with persist
- **Database**: PostgreSQL + Prisma ORM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Email**: Nodemailer

## 📝 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP code

### Assets
- `GET /api/assets` - Get all assets
- `PATCH /api/assets/[id]/price` - Update asset price (admin)

### Investments
- `GET /api/investments` - Get user investments
- `POST /api/investments` - Create new investment

### Withdrawals
- `GET /api/withdrawals` - Get user withdrawals
- `POST /api/withdrawals` - Create withdrawal request

### Admin
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/[id]/balance` - Update user balance
- `POST /api/admin/users/[id]/dime-account` - Create Dime account
- `POST /api/admin/investments/[id]/approve` - Approve investment
- `POST /api/admin/withdrawals/[id]/process` - Process withdrawal
- `GET /api/admin/stats` - Get platform statistics

## 🎯 User Flow Examples

### Investment Flow
1. User logs in → Dashboard
2. Click "Make an Investment"
3. Select asset (e.g., Gold)
4. Enter investment amount
5. Continue to deposit details
6. View bank/crypto details
7. Make payment externally
8. Enter transaction proof
9. Submit investment
10. Receive receipt email
11. Admin gets WhatsApp notification
12. Admin approves investment
13. User balance updated
14. Investment appears in dashboard

### Withdrawal Flow
1. User clicks "Withdraw Funds"
2. Enter withdrawal amount
3. Provide Dime Bank details
4. Submit request
5. Admin gets notification
6. Admin processes withdrawal
7. User receives confirmation email
8. Amount transferred to Dime account

## 🐛 Known Issues (Non-Critical)

- Tailwind CSS v4 gradient warnings (cosmetic, can be ignored)
- Some TypeScript type inference warnings (functional, no runtime impact)

## 🔮 Future Enhancements

Potential additions for future versions:
- Two-factor authentication (2FA)
- Investment profit calculator
- Automated dividend distributions
- Mobile app version
- Live chat support
- KYC document upload
- Multi-currency support
- Investment recommendations AI

## 📞 Support

For issues or questions:
1. Check the console for detailed error messages
2. Review the API response in Network tab
3. Verify environment variables are set correctly
4. Ensure database is seeded with test data

## 🎓 Learning Resources

- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com
- React Hook Form: https://react-hook-form.com
- Zustand: https://github.com/pmndrs/zustand

---

**Built with ❤️ using Next.js, Prisma, and modern web technologies**

Version: 1.0.0
Last Updated: 2024
