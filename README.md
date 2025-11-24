# crestcat - Professional Investment Platform

A comprehensive, industrial-standard investment platform built with Next.js 16, TypeScript, Prisma, and Zustand. This platform allows users to invest in various assets (gold, silver, crypto, real estate) with real-time analytics, admin management, and automated email notifications.

## 🚀 Features

### User Features
- **Email Registration with OTP Verification** - Secure account creation with email OTP
- **Multi-Asset Investment** - Invest in Gold, Silver, Bitcoin, Real Estate, and more
- **Real-Time Portfolio Tracking** - Live updates of investment values based on market prices
- **Dime Bank Integration** - Users can create/use Dime Bank accounts for withdrawals
- **Investment Dashboard** - Professional UI showing portfolio performance, analytics, and charts
- **Deposit & Withdrawal System** - Submit deposits with proof, request withdrawals
- **Email Receipts** - Automated receipt generation for all transactions
- **Notifications** - Real-time notifications for all account activities

### Admin Features
- **Comprehensive Admin Dashboard** - Full control panel with analytics and statistics
- **User Management** - View all users, their balances, and account details
- **Balance Manipulation** - Increase, decrease, or set user balances
- **Transaction Approval** - Approve or reject deposits and investments
- **Withdrawal Processing** - Process withdrawal requests and send receipts
- **Dime Bank Account Creation** - Create Dime Bank accounts for users
- **Asset Price Management** - Update asset prices in real-time
- **WhatsApp Notifications** - Get notified on WhatsApp for new deposits/withdrawals
- **Analytics Dashboard** - View platform statistics, asset distribution, and recent transactions

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: Zustand with persist middleware
- **Forms**: React Hook Form with Yup validation
- **Database**: PostgreSQL with Prisma ORM
- **Email**: Nodemailer for email notifications
- **Authentication**: Custom JWT-based auth with OTP verification
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Gmail account (for email notifications) or other SMTP server
- WhatsApp Business API (optional, for admin notifications)

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd /home/sunxtech/Desktop/project/investment
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (use `.env.example` as template):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/investment_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Email Configuration (NodeMailer)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@investment.com"

# WhatsApp API (for admin notifications)
WHATSAPP_API_URL="https://api.whatsapp.com/send"
WHATSAPP_ADMIN_NUMBER="+1234567890"

# Admin Settings
ADMIN_EMAIL="admin@investment.com"
ADMIN_INITIAL_PASSWORD="ChangeThisPassword123!"

# Upload/Storage
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# App Settings
NEXT_PUBLIC_APP_NAME="crestcat"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database schema
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

## 👥 Test Credentials

After seeding the database, use these credentials:

**Admin Account:**
- Email: `admin@crestcat.com`
- Password: `Admin@123456`

**Test User Account:**
- Email: `user@test.com`
- Password: `User@123456`

## 📁 Project Structure

```
investment/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── assets/        # Asset management
│   │   │   ├── investments/   # Investment operations
│   │   │   ├── withdrawals/   # Withdrawal requests
│   │   │   └── admin/         # Admin operations
│   │   ├── auth/              # Auth pages (login, register, verify)
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # Admin panel
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Custom components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   ├── email.ts           # Email utilities
│   │   └── whatsapp.ts        # WhatsApp notifications
│   └── store/
│       ├── authStore.ts       # Authentication state
│       ├── assetsStore.ts     # Assets state
│       ├── investmentsStore.ts # Investments state
│       └── notificationsStore.ts # Notifications state
├── public/                    # Static files
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 🔐 Authentication Flow

1. **Registration**
   - User submits email, password, name, and Dime Bank details (optional)
   - System hashes password and creates user account
   - OTP code is generated and sent to user's email
   - User must verify email before logging in

2. **OTP Verification**
   - User enters 6-digit OTP code from email
   - System validates OTP and marks email as verified
   - User can now log in

3. **Login**
   - User submits email and password
   - System verifies credentials and email verification status
   - Session is created and user is redirected to dashboard

## 💰 Investment Flow

1. **Select Asset** - User browses available assets and selects one to invest in
2. **Enter Amount** - User specifies investment amount (must meet minimum)
3. **View Deposit Details** - System displays deposit account details (USDT, bank, etc.)
4. **Submit Proof** - User uploads payment proof and submits
5. **Receipt Sent** - User receives deposit receipt via email
6. **Admin Notification** - Admin receives WhatsApp notification
7. **Admin Approval** - Admin reviews and approves/rejects deposit
8. **Investment Activated** - Upon approval, investment becomes active
9. **Real-Time Updates** - Investment value updates with asset price changes

## 🏦 Withdrawal Flow

1. **Request Withdrawal** - User enters amount and Dime Bank details
2. **Balance Check** - System verifies sufficient balance
3. **Submit Request** - Withdrawal request is created
4. **Admin Notification** - Admin receives WhatsApp notification
5. **Admin Processing** - Admin processes withdrawal
6. **Balance Deduction** - Amount is deducted from user balance
7. **Receipt Sent** - User receives withdrawal receipt via email
8. **Dime Bank Transfer** - User checks Dime Bank for funds

## 👨‍💼 Admin Operations

### User Management
- View all registered users
- See user balances, investments, and activity
- Create Dime Bank accounts for users
- Send account details via email

### Balance Manipulation
- **Set Balance**: Set exact balance amount
- **Increase Balance**: Add to current balance
- **Decrease Balance**: Subtract from balance
- All changes are logged in transactions

### Transaction Management
- Approve/reject deposit requests
- Process withdrawal requests
- View transaction history
- Add admin notes

### Asset Management
- Create new investment assets
- Update asset prices in real-time
- Asset price changes automatically update all active investments
- User balances are adjusted based on profit/loss

## 📧 Email Notifications

The system sends automated emails for:
- **OTP Verification** - 6-digit code for email verification
- **Deposit Receipt** - Confirmation of deposit submission
- **Withdrawal Receipt** - Confirmation of completed withdrawal
- **Dime Bank Account** - Account details when created by admin
- **Admin Notifications** - WhatsApp alerts for deposits/withdrawals

## 📊 Real-Time Asset Prices

- Asset prices are stored with historical data
- Admin can update prices through API or admin panel
- Price updates automatically recalculate:
  - Current value of all active investments
  - Profit/loss for each investment
  - User total balances
- Both users and admin see real-time updates

## 🔒 Security Features

- Password hashing with bcryptjs
- OTP-based email verification
- Role-based access control (USER/ADMIN)
- Secure API routes with authentication checks
- Input validation with Yup schemas
- SQL injection protection via Prisma ORM

## 🎨 UI/UX Features

- Professional, modern design
- Responsive layout (mobile, tablet, desktop)
- Clean, minimal icons and components
- Smooth transitions and animations
- Accessible color contrast
- Loading states and error handling

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP code

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset (admin)
- `PATCH /api/assets/[id]/price` - Update asset price (admin)

### Investments
- `GET /api/investments?userId=xxx` - Get user investments
- `POST /api/investments` - Create investment

### Withdrawals
- `GET /api/withdrawals?userId=xxx` - Get user withdrawals
- `POST /api/withdrawals` - Request withdrawal

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `PATCH /api/admin/users/[id]/balance` - Update user balance
- `POST /api/admin/users/[id]/dime-account` - Create Dime account
- `PATCH /api/admin/investments/[id]/approve` - Approve/reject investment
- `PATCH /api/admin/withdrawals/[id]/process` - Process withdrawal

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to update all environment variables in `.env` for production:
- Use strong, unique `NEXTAUTH_SECRET`
- Configure production database URL
- Use production email SMTP settings
- Set correct `NEXT_PUBLIC_APP_URL`

### Recommended Hosting
- **Vercel** - Recommended for Next.js apps
- **Railway** - For database and app hosting
- **Heroku** - Alternative platform
- **DigitalOcean** - VPS option

## 📝 Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check database credentials

### Email Not Sending
- Verify SMTP settings
- For Gmail, enable "Less secure app access" or use App Password
- Check spam folder

### Build Errors
- Clear `.next` folder and rebuild
- Run `npx prisma generate` if Prisma types are missing
- Check for TypeScript errors

## 📄 License

This project is private and proprietary.

## 👨‍💻 Support

For support and questions, contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
