# Admin Transactions Management Guide

## Overview
The Admin Transactions page (`/admin/transactions`) provides a centralized dashboard for managing all investment and withdrawal transactions across the platform. This is a critical admin tool for processing user requests and maintaining transaction records.

## Access
- **Route**: `/admin/transactions`
- **Permissions**: Admin users only (role: ADMIN)
- **Navigation**: From Admin Dashboard → "Transaction Management"

## Features

### 1. Investment Management Tab
Displays all investment transactions with the following statuses:

#### Pending Investments
- **Purpose**: Review and approve/reject new investment requests
- **Display**: Orange-highlighted cards with complete investment details
- **Information Shown**:
  - User name and email
  - Asset name (e.g., Gold, Real Estate)
  - Investment amount
  - Deposit method (Dime Bank, Eversend, Mobile Money)
  - Receipt ID for tracking
  - Timestamp
- **Actions**:
  - 👁️ **View Details**: Opens modal with full investment information
  - ✅ **Approve**: Confirms investment and updates user portfolio
  - ❌ **Reject**: Declines investment request

#### Approved Investments
- **Purpose**: Historical record of approved investments
- **Display**: Standard cards showing confirmed investments
- **Limit**: Shows latest 10 approved investments
- **Information**: User, asset, amount, receipt ID, timestamp

### 2. Withdrawals Management Tab
Displays all withdrawal requests with the following statuses:

#### Pending Withdrawals
- **Purpose**: Process withdrawal requests from users
- **Display**: Yellow-highlighted cards with withdrawal details
- **Information Shown**:
  - User name and email
  - Withdrawal amount
  - Current user balance (for verification)
  - Dime Bank account number
  - Dime Bank account name
  - Timestamp
- **Actions**:
  - 📤 **Process**: Opens modal to approve/reject withdrawal
  - ❌ **Reject**: Instantly rejects withdrawal request

#### Completed Withdrawals
- **Purpose**: Historical record of processed withdrawals
- **Display**: Standard cards showing completed withdrawals
- **Limit**: Shows latest 10 completed withdrawals
- **Information**: User, amount, completion timestamp

### 3. Details Modal
Interactive dialog for reviewing and processing transactions:

#### For Investments:
- Full user details (name, email)
- Investment amount (large, prominent display)
- Asset information (name, symbol)
- Deposit method
- Deposit proof (if provided)
- **Actions**:
  - **Approve Button**: Confirms investment and adds to user portfolio
  - **Reject Button**: Declines investment request

#### For Withdrawals:
- Full user details
- Withdrawal amount
- Dime Bank account details (account number, account name)
- **Processing Note**: Optional field for admin to add notes
- **Actions**:
  - **Approve & Send**: 
    - Deducts amount from user balance
    - Updates transaction status to COMPLETED
    - Sends email receipt to user
    - Records admin notes
  - **Reject**: Declines withdrawal without affecting balance

## Status Badges
Visual indicators for transaction states:
- 🟡 **Yellow/Orange "Pending"**: Awaiting admin action
- 🟢 **Green "Approved/Completed"**: Successfully processed
- 🔴 **Red "Rejected"**: Declined by admin

## Notification Counters
- Investment tab shows count of pending investments
- Withdrawal tab shows count of pending withdrawals
- Helps prioritize admin workload

## Processing Workflow

### Investment Processing:
1. User submits investment through `/dashboard/invest`
2. Investment appears in "Pending Investments" section
3. Admin reviews details (amount, asset, deposit method)
4. Admin approves or rejects:
   - **Approve**: Investment added to user portfolio, status updated
   - **Reject**: Investment declined, user can retry
5. Approved investments move to "Approved Investments" section

### Withdrawal Processing:
1. User requests withdrawal through `/dashboard/withdraw`
2. Withdrawal appears in "Pending Withdrawals" section
3. Admin verifies:
   - User has sufficient balance
   - Bank account details are correct
4. Admin processes withdrawal:
   - **Approve**: 
     - User balance deducted
     - Email receipt sent to user
     - Status updated to COMPLETED
     - Transaction record created
   - **Reject**: Withdrawal declined, balance unchanged
5. Completed withdrawals move to "Completed Withdrawals" section

## API Endpoints Used

### GET Endpoints:
- `GET /api/investments` - Fetches all investments (admin view)
- `GET /api/withdrawals` - Fetches all withdrawals (admin view)

### POST Endpoints:
- `POST /api/admin/investments/[id]/approve` - Approve/reject investment
  - Body: `{ reject: boolean }` (optional)
- `POST /api/admin/withdrawals/[id]/process` - Process withdrawal
  - Body: `{ approved: boolean, note: string }`

## Data Display
All monetary values formatted as currency (e.g., $1,000.00)
All timestamps formatted as readable dates (e.g., "Jan 15, 2024 10:30 AM")

## Security Features
- Protected route - redirects non-admin users
- Auth check on component mount
- Prevents unauthorized access to transaction data
- Secure API calls with admin-only endpoints

## User Experience
- **Loading State**: Spinner displayed while fetching data
- **Empty States**: Friendly messages when no transactions exist
- **Processing State**: Buttons disabled during API calls to prevent double-submission
- **Real-time Updates**: Data refreshes after each transaction processed
- **Responsive Design**: Works on desktop and mobile devices

## Technical Details
- **Framework**: Next.js 16 (App Router)
- **State Management**: React useState hooks
- **UI Components**: Shadcn UI (Tabs, Cards, Dialogs, Buttons)
- **Authentication**: Zustand auth store
- **Data Fetching**: Client-side fetch with loading states

## Common Admin Tasks

### 1. Approving an Investment:
1. Navigate to `/admin/transactions`
2. Click "Investments" tab
3. Find pending investment in list
4. Click eye icon or approve button
5. Review details in modal
6. Click "Approve" button

### 2. Processing a Withdrawal:
1. Navigate to `/admin/transactions`
2. Click "Withdrawals" tab
3. Find pending withdrawal
4. Click "Process" button
5. Verify bank account details
6. Add optional processing note
7. Click "Approve & Send"

### 3. Rejecting a Transaction:
1. Locate transaction in appropriate tab
2. Click reject button (X icon)
3. Confirm action
4. Transaction status updated immediately

## Best Practices
- ✅ Always verify user balance before approving withdrawals
- ✅ Check deposit proof for large investments
- ✅ Add processing notes for record-keeping
- ✅ Review bank account details carefully
- ✅ Monitor pending transaction counts regularly
- ⚠️ Double-check amounts before approving
- ⚠️ Ensure sufficient balance for withdrawals

## Limitations
- Shows only latest 10 approved/completed transactions per category
- No pagination for historical transactions
- No search/filter functionality (future enhancement)
- Cannot edit transactions after processing

## Related Pages
- `/admin` - Main Admin Dashboard
- `/admin/investments` - Dedicated Investments Management
- `/admin/users` - User Management
- `/admin/withdrawals` - Dedicated Withdrawals Management

## Schema References
```typescript
interface Investment {
  id: string;
  amount: number;
  status: string; // PENDING | APPROVED | REJECTED
  receiptId: string;
  depositMethod: string;
  depositProof: string | null;
  createdAt: string;
  user: { name: string; email: string; }
  asset: { name: string; symbol: string; }
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string; // PENDING | COMPLETED | REJECTED
  dimeBankAccountNumber: string;
  dimeBankAccountName: string;
  createdAt: string;
  user: { name: string; email: string; balance: number; }
}
```

## Support
For issues or questions about the Admin Transactions page:
1. Check server logs for API errors
2. Verify database connection
3. Ensure user has ADMIN role
4. Check browser console for client-side errors
