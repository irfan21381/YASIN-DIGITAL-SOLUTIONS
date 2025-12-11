# Razorpay Initialization Fix

## Problem
Razorpay was being initialized at module load time, causing the server to crash if environment variables were not set.

## Solution
Changed to **lazy initialization** - Razorpay is only initialized when actually needed (when a payment function is called).

## Files Updated

### 1. `backend/controllers/paymentController.ts`
- Changed from immediate initialization to `getRazorpayInstance()` function
- Razorpay is only created when `createRazorpayOrder` is called
- Throws helpful error if credentials are missing

### 2. `backend/controllers/paymentRequestController.ts`
- Same lazy initialization pattern
- Razorpay created only when `createPaymentRequestOrder` is called

### 3. `backend/controllers/salaryPaymentController.ts`
- Same lazy initialization pattern
- Razorpay created only when `createSalaryPayment` is called

## Benefits

1. **Server starts even without Razorpay credentials** - No crash on startup
2. **Clear error messages** - Users get helpful error when trying to use payment features without credentials
3. **Better error handling** - Errors occur at the right time (when payment is attempted, not at startup)

## Environment Variables Required

To use payment features, set these in your `.env` file:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## Testing

The server should now start successfully even without Razorpay credentials. Payment endpoints will return a clear error message if credentials are missing when called.

