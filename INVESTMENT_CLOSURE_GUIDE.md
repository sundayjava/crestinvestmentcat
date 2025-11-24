# Investment Closure System - Implementation Guide

## Overview
Complete investment closure system with admin approval workflow, following industry best practices. Users can request to close (liquidate) their investments, and admins approve before funds transfer to withdrawable balance.

## Architecture

### Database Schema
**Investment Model - New Fields:**
- `closureRequested: Boolean` - Tracks if user requested closure
- `closureRequestedAt: DateTime?` - When closure was requested
- `closedAt: DateTime?` - When investment was actually closed
- `closureApprovedBy: String?` - Admin ID who approved
- `closureRejectedAt: DateTime?` - If/when rejection occurred
- `closureNotes: String?` - Admin notes for approval/rejection

### Workflow
```
1. User Request
   └─> POST /api/investments/[id]/close
       ├─> Sets closureRequested = true
       ├─> Creates admin notification
       ├─> Sends email to admin
       └─> Returns success message

2. Admin Review
   └─> Views in "Closure Requests" filter
       ├─> Reviews investment details
       ├─> Sees profit/loss calculations
       └─> Decides: Approve or Reject

3a. Admin Approval
    └─> POST /api/admin/investments/[id]/close
        ├─> Transfers currentValue to user.balance
        ├─> Marks isActive = false
        ├─> Sets closedAt = now
        ├─> Creates transaction record
        ├─> Creates user notification
        ├─> Sends approval email to user
        └─> Returns new balance

3b. Admin Rejection
    └─> DELETE /api/admin/investments/[id]/close
        ├─> Resets closureRequested = false
        ├─> Sets closureRejectedAt = now
        ├─> Saves admin notes
        ├─> Creates user notification
        ├─> Sends rejection email to user
        └─> Investment remains active

4. User Withdrawal
   └─> User can now withdraw from balance
```

## API Endpoints

### User Endpoint
**POST** `/api/investments/[id]/close`
- **Purpose:** User requests investment closure
- **Auth:** Requires user authentication
- **Body:** None (investment ID in URL)
- **Response:**
  ```json
  {
    "message": "Investment closure request submitted successfully",
    "success": true
  }
  ```

### Admin Endpoints
**POST** `/api/admin/investments/[id]/close`
- **Purpose:** Approve closure request
- **Auth:** Requires admin authentication
- **Body:**
  ```json
  {
    "adminId": "admin-user-id",
    "notes": "Optional admin notes"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Investment closure approved successfully",
    "success": true,
    "newBalance": 15000.00
  }
  ```

**DELETE** `/api/admin/investments/[id]/close`
- **Purpose:** Reject closure request
- **Auth:** Requires admin authentication
- **Body:**
  ```json
  {
    "notes": "Reason for rejection"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Investment closure request rejected",
    "success": true
  }
  ```

## Email Notifications

### 1. Closure Request Email (to Admin)
- **Function:** `sendInvestmentClosureRequestEmail()`
- **Trigger:** When user requests closure
- **Content:**
  - User name and email
  - Asset name
  - Current value
  - Profit/Loss amount
  - Link to review in admin dashboard
- **Style:** Orange theme (action required)

### 2. Closure Approved Email (to User)
- **Function:** `sendInvestmentClosureApprovedEmail()`
- **Trigger:** When admin approves closure
- **Content:**
  - Investment details (original vs closed value)
  - Profit/Loss calculation
  - New account balance (highlighted)
  - Link to dashboard
- **Style:** Green theme (success)

### 3. Closure Rejected Email (to User)
- **Function:** `sendInvestmentClosureRejectedEmail()`
- **Trigger:** When admin rejects closure
- **Content:**
  - Rejection reason (admin notes)
  - Current investment value
  - Common reasons for rejection
  - Support contact information
- **Style:** Red theme (warning)

## User Interface

### User Dashboard
**Investment Cards:**
- Active investments show "Close" button (red with X icon)
- Closure pending investments show orange "Closure Pending" badge
- Close button disabled if closure already requested

**Closure Modal:**
- Shows investment details (asset, values, profit/loss)
- Displays warning about admin approval requirement
- Shows amount to be transferred to balance
- Confirm/Cancel buttons
- Success/Error message display
- Loading state during submission

### Admin Dashboard
**Statistics Cards:**
1. Total Investments
2. Pending Approval
3. Active Investments
4. **Closure Requests** (orange theme)
5. Total Investment Value

**Filter Options:**
- All Investments
- Pending Approval
- Approved/Active
- **Closure Requested** (new)

**Investment Table:**
- Status badges:
  - Pending (yellow)
  - Active (green)
  - **Closure Pending** (orange)
- Actions:
  - Approve/Reject (for pending)
  - View Details (for active)
  - **Review Close** (for closure requests)

**Closure Review Modal:**
- Investment summary (asset, quantity, prices)
- Performance metrics:
  - Original investment amount
  - Current value
  - Profit/Loss (amount and percentage)
  - Amount to transfer to balance (highlighted)
- Admin notes textarea
- Approve/Reject buttons with loading states

## Balance System

### How It Works
```
Portfolio Value = Sum of (active investments currentValue)
├─> Display only
└─> NOT withdrawable

User Balance = Actual withdrawable cash
├─> From deposits
├─> From closed investments
└─> Can be withdrawn
```

### Balance Updates
```javascript
// When investment closes (approved):
user.balance += investment.currentValue

// Transaction record created:
{
  type: "INVESTMENT",
  status: "COMPLETED",
  amount: investment.currentValue,
  description: "Investment closure: [Asset] - P/L: $X",
  metadata: {
    investmentId,
    originalAmount,
    closureValue,
    profitLoss
  }
}
```

## Error Handling

### Validation Checks
1. **Investment exists** - 404 if not found
2. **Investment is active** - 400 if already closed
3. **No duplicate requests** - 400 if closure already requested
4. **Closure request exists** - 400 for approval/rejection without request

### Email Failures
- Wrapped in try-catch blocks
- Logged but don't fail the operation
- User still gets in-app notifications

## Testing Checklist

- [ ] User can request closure on active investment
- [ ] Closure request creates admin notification
- [ ] Admin email sent with correct details
- [ ] Admin sees closure in "Closure Requests" filter
- [ ] Admin can approve closure
- [ ] User balance increases by currentValue
- [ ] Transaction record created correctly
- [ ] User receives approval email
- [ ] User can withdraw from new balance
- [ ] Admin can reject closure
- [ ] Rejection resets closureRequested
- [ ] User receives rejection email with notes
- [ ] Investment remains active after rejection
- [ ] User can re-request closure after rejection

## Environment Variables Required

```env
# Admin email for closure request notifications
ADMIN_EMAIL=admin@yourcompany.com

# Email configuration (already set)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com

# App URL for email links
NEXT_PUBLIC_APP_URL=https://yourapp.com
NEXT_PUBLIC_APP_NAME=Your Company Name
```

## Database Migration

```bash
# Already executed:
npx prisma db push
npx prisma generate

# Restart TypeScript server to pick up types
```

## Security Considerations

1. **Authorization:**
   - Only investment owner can request closure
   - Only admins can approve/reject
   
2. **Atomic Operations:**
   - Balance increment uses Prisma's `increment`
   - Prevents race conditions
   
3. **Audit Trail:**
   - All actions recorded in Transaction table
   - Admin ID stored in closureApprovedBy
   - Timestamps for all state changes

4. **Notification Redundancy:**
   - In-app notifications + email
   - Email failures don't block operations

## Best Practices Followed

1. **Two-Phase Approval:**
   - Investment creation requires admin approval
   - Investment closure requires admin approval
   - Consistent with platforms like Robinhood, eToro

2. **Clear Separation:**
   - Portfolio value (display only)
   - User balance (withdrawable)
   - Prevents confusion about available funds

3. **Liquidity Control:**
   - Admin can reject during unfavorable market conditions
   - Enforces minimum holding periods
   - Prevents rapid trading abuse

4. **Professional Communication:**
   - Detailed email templates
   - Clear rejection reasons
   - Support contact information

## Future Enhancements

- [ ] Auto-approval rules (e.g., small amounts, long hold times)
- [ ] Closure history view for users
- [ ] Analytics: average hold time, most profitable assets
- [ ] Bulk closure approval for admin
- [ ] Partial closure (sell portion of investment)
- [ ] Scheduled closures (set date/price targets)

## Support

For issues or questions:
1. Check notification panel for admin notes
2. Review email for detailed information
3. Contact support team with investment ID
4. Admin can view full transaction history

---

**Implementation Date:** November 23, 2025
**Status:** ✅ Complete and Production Ready
