# 🚀 IMPLEMENTATION GUIDE

This document provides a step-by-step guide to complete the remaining pages and functionality for the crestcat platform.

## ✅ What's Already Built

### Core Infrastructure
- ✅ Complete database schema with Prisma
- ✅ All API routes (auth, investments, withdrawals, admin)
- ✅ Zustand stores for state management
- ✅ Email notification system
- ✅ WhatsApp notification system
- ✅ Professional landing page
- ✅ UI component library (shadcn/ui style)
- ✅ Utility functions and helpers
- ✅ Database seed script

### API Endpoints Created
- ✅ `/api/auth/register` - User registration with OTP
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/verify-otp` - Email verification
- ✅ `/api/auth/resend-otp` - Resend OTP
- ✅ `/api/assets` - Get/Create assets
- ✅ `/api/assets/[id]/price` - Update asset price
- ✅ `/api/investments` - Get/Create investments
- ✅ `/api/withdrawals` - Get/Create withdrawals
- ✅ `/api/admin/users` - User management
- ✅ `/api/admin/users/[id]/balance` - Balance manipulation
- ✅ `/api/admin/users/[id]/dime-account` - Create Dime account
- ✅ `/api/admin/investments/[id]/approve` - Approve investments
- ✅ `/api/admin/withdrawals/[id]/process` - Process withdrawals
- ✅ `/api/admin/stats` - Admin statistics

## 🔨 Pages to Build

### 1. Authentication Pages

#### `/src/app/auth/register/page.tsx`
Features:
- Email, password, name fields
- Checkbox for "Do you have a Dime Bank account?"
- If NO: Show fields for account details (will be created by admin)
- Form validation with React Hook Form + Yup
- Submit to `/api/auth/register`
- Redirect to OTP verification page

#### `/src/app/auth/login/page.tsx`
Features:
- Email and password fields
- Form validation
- Submit to `/api/auth/login`
- Store user in Zustand auth store
- Redirect based on role (admin → /admin, user → /dashboard)

#### `/src/app/auth/verify-otp/page.tsx`
Features:
- 6-digit OTP input field
- Resend OTP button
- Submit to `/api/auth/verify-otp`
- Success → redirect to login

### 2. User Dashboard

#### `/src/app/dashboard/page.tsx`
Features:
- Header with balance, user name, logout button
- Portfolio summary cards:
  - Total Balance
  - Active Investments
  - Total Profit/Loss
  - Pending Transactions
- Asset cards showing:
  - Asset name and symbol
  - Current price
  - User's investment in that asset
  - Profit/loss
- Investment button → redirects to `/dashboard/invest`
- Withdrawal button → redirects to `/dashboard/withdraw`
- Transactions table with recent activity

#### `/src/app/dashboard/invest/page.tsx`
Features:
- Asset selection (cards or dropdown)
- Amount input (validate against minimum)
- Display deposit details (USDT address, bank account)
- Upload deposit proof
- Submit button → POST to `/api/investments`
- Success → show receipt, send email

#### `/src/app/dashboard/withdraw/page.tsx`
Features:
- Amount input (validate against balance)
- Dime Bank account number field
- Dime Bank account name field
- Submit button → POST to `/api/withdrawals`
- Success → show pending message

### 3. Admin Dashboard

#### `/src/app/admin/page.tsx`
Features:
- Statistics cards:
  - Total Users
  - Total Investments
  - Pending Deposits
  - Pending Withdrawals
  - Total Transaction Volume
- Recent transactions table
- Asset distribution chart
- Quick actions: Manage Users, Manage Assets, View Transactions

#### `/src/app/admin/users/page.tsx`
Features:
- Users table with columns:
  - Email, Name, Balance, Has Dime Account, Actions
- Actions:
  - Adjust Balance (modal)
  - Create Dime Account (modal)
  - View Details
- Balance adjustment modal:
  - Set, Increase, or Decrease options
  - Amount input
  - Submit → PATCH `/api/admin/users/[id]/balance`

#### `/src/app/admin/transactions/page.tsx`
Features:
- Tabs: Pending Deposits | Pending Withdrawals | All Transactions
- Pending Deposits tab:
  - Table with user, amount, asset, date, deposit proof
  - Approve/Reject buttons
  - Submit → PATCH `/api/admin/investments/[id]/approve`
- Pending Withdrawals tab:
  - Table with user, amount, bank account, date
  - Process button (opens modal with notes)
  - Submit → PATCH `/api/admin/withdrawals/[id]/process`

#### `/src/app/admin/assets/page.tsx`
Features:
- Assets table with current price
- Update Price button (opens modal)
- Modal: New price input → PATCH `/api/assets/[id]/price`
- Create Asset button (opens modal)
- Create modal: Name, Symbol, Type, Description, Price, Min Investment

## 📝 Implementation Steps

### Step 1: Set Up Database
```bash
# Create .env file from .env.example
cp .env.example .env

# Edit .env and add your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/investment_db"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### Step 2: Create Auth Pages
Create the three auth pages listed above following this structure:
1. Use React Hook Form + Yup for validation
2. Use Zustand authStore for state management
3. Use Button, Input, Label, Card components from `@/components/ui`
4. Style with Tailwind CSS
5. Handle loading and error states

Example validation schema (Yup):
```typescript
const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  name: yup.string().required(),
  hasDimeAccount: yup.boolean(),
  dimeBankAccountNumber: yup.string().when('hasDimeAccount', {
    is: false,
    then: (schema) => schema.required(),
  }),
});
```

### Step 3: Create User Dashboard
1. Start with main dashboard page (`/dashboard/page.tsx`)
2. Fetch user data and investments on page load
3. Display portfolio summary
4. Create invest and withdraw pages
5. Add real-time updates using setInterval or WebSockets

### Step 4: Create Admin Dashboard
1. Create main admin page with statistics
2. Implement user management page
3. Add transaction management with approval workflow
4. Create asset management page

### Step 5: Add Real-Time Features
1. Set up interval to fetch asset prices
2. Update Zustand stores when prices change
3. Recalculate investment values
4. Display notifications for changes

### Step 6: Testing
1. Test user registration and OTP verification
2. Test investment flow end-to-end
3. Test withdrawal flow
4. Test admin operations (approve, reject, balance changes)
5. Test email notifications

### Step 7: Polish & Deploy
1. Add loading spinners
2. Add error boundaries
3. Optimize images
4. Build for production
5. Deploy to Vercel or similar platform

## 🎨 Design Guidelines

### Colors
- Primary: Purple (#7c3aed) to Blue (#3b82f6) gradient
- Background: Slate-50 (#f8fafc)
- Text: Gray-900 (#111827)
- Success: Green-600 (#16a34a)
- Error: Red-600 (#dc2626)

### Typography
- Headings: Bold, large (2xl-4xl)
- Body: Regular, medium (sm-base)
- Buttons: Medium font weight
- Keep icons small (h-4 w-4 to h-6 w-6)

### Components
- Use Card for containers
- Use Button with variants (default, outline, ghost)
- Use Input with proper labels
- Add hover and focus states
- Responsive: mobile-first approach

## 🔐 Security Checklist

- [ ] Validate all inputs on client and server
- [ ] Sanitize user-uploaded content
- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Implement rate limiting for API routes
- [ ] Add CSRF protection
- [ ] Hash passwords with bcryptjs
- [ ] Validate file uploads (type, size)

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev

# Access:
# Landing: http://localhost:3000
# Login: http://localhost:3000/auth/login
# Test credentials in README.md
```

## 📚 Helpful Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Yup Validation](https://github.com/jquense/yup)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💡 Tips

1. **Start small**: Build one page at a time, test thoroughly
2. **Use the API**: All endpoints are ready, just call them
3. **Check the stores**: Zustand stores are set up, use them
4. **Follow patterns**: Look at existing code for patterns
5. **Test with seed data**: Use the seeded users to test flows
6. **Read the README**: Full documentation is in README.md

## 🐛 Common Issues & Solutions

### Issue: Prisma Client not found
```bash
npx prisma generate
```

### Issue: Database connection error
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify credentials

### Issue: Email not sending
- Check EMAIL_* variables in .env
- For Gmail, use App Password
- Test SMTP connection

### Issue: Build errors
```bash
rm -rf .next
npm run build
```

---

**You now have all the infrastructure needed. Just build the pages following this guide!**
