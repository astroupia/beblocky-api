# Payment & Subscription Integration Guide

This guide explains how to integrate with the Payment and Subscription modules for the BeBlocky API.

## Table of Contents

- [Overview](#overview)
- [Payment Module](#payment-module)
- [Stripe Integration](#stripe-integration)
- [Subscription Module](#subscription-module)
- [URL Structure](#url-structure)
- [Integration Flow](#integration-flow)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)

## Overview

The payment system supports two payment providers:

1. **ArifPay** - Ethiopian payment gateway (primary)
2. **Stripe** - International payment gateway (for international users)

Both systems integrate with a subscription management system that handles recurring billing and plan management.

### Key Changes in Latest Version

- **Phone field is now REQUIRED** for ArifPay payments
- **Automatic payment method mapping** to ArifPay format
- **Enhanced error handling** with detailed logging
- **Stripe price IDs** for subscription plans
- **Improved URL handling** for success, cancel, and notify callbacks

## Payment Module

### Base URL

```
POST /payment
GET /payment/:userId
POST /payment/responseStatus
```

### 1. Create Payment Session

**Endpoint:** `POST /payment`

**Description:** Creates a new payment session using ArifPay

**Request Body:**

```typescript
{
  userId: string;           // User ID (string from better-auth)
  amount: number;           // Payment amount
  cancelUrl: string;        // URL to redirect on cancellation
  successUrl: string;       // URL to redirect on success
  errorUrl: string;         // URL to redirect on error
  notifyUrl: string;        // Webhook URL for status updates
  phone: number;            // User's phone number (REQUIRED - Ethiopian format: 251912345678)
  email?: string;           // User's email (optional)
  nonce?: string;           // Payment nonce (optional)
  paymentMethods?: PaymentMethod[]; // Allowed payment methods
  expireDate: Date;         // Payment session expiry date
  items: Item[];            // Array of items to purchase
  lang?: string;            // Language preference (optional)
  transactionStatus?: PaymentStatus; // Initial status (optional)
  transactionId?: string;   // Transaction ID (optional)
  sessionId?: string;       // Session ID (optional)
}

// Item structure
{
  name: string;             // Item name
  quantity: number;         // Item quantity
  price: number;            // Item price
  description?: string;     // Item description (optional)
  image?: string;           // Item image URL (optional)
}
```

**Payment Methods Available:**

```typescript
enum PaymentMethod {
  TELEBIRR = 'TELEBIRR',
  AWASH = 'AWASH',
  AWASH_WALLET = 'AWASH_WALLET',
  PSS = 'PSS',
  CBE = 'CBE',
  AMOLE = 'AMOLE',
  BOA = 'BOA',
  KACHA = 'KACHA',
  TELEBIRR_USSD = 'TELEBIRR_USSD',
  HELLOCASH = 'HELLOCASH',
  MPESSA = 'MPESSA',
}
```

**Note:** The API automatically maps these payment methods to ArifPay's expected format:

- `AWASH` → `AWASH_BIRR`
- `CBE` → `CBE_BIRR`
- `BOA` → `BOA_BIRR`
- Others remain the same

**Response:**

```typescript
{
  sessionId: string; // Payment session ID
  transactionId: string; // Transaction ID
  paymentUrl: string; // URL to redirect user for payment
  cancelUrl: string; // Cancel URL
}
```

**Example Request:**

```javascript
const response = await fetch('/payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user_123456789',
    amount: 1000,
    cancelUrl: 'https://yourapp.com/cancel',
    successUrl: 'https://yourapp.com/success',
    errorUrl: 'https://yourapp.com/error',
    notifyUrl: 'https://yourapp.com/webhook',
    phone: 251912345678, // REQUIRED - Ethiopian phone number format
    email: 'user@example.com',
    paymentMethods: ['TELEBIRR', 'AWASH', 'AWASH_WALLET', 'CBE', 'AMOLE'],
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    items: [
      {
        name: 'Premium Subscription',
        quantity: 1,
        price: 1000,
        description: 'Monthly premium access',
      },
    ],
  }),
});
```

### 2. Get User Payments

**Endpoint:** `GET /payment/:userId`

**Description:** Retrieves all payments for a specific user

**Response:**

```typescript
{
  statusCode: number;
  message: string;
  data: PaymentDocument[] | null;
}
```

**Example:**

```javascript
const response = await fetch('/payment/user_123456789');
const payments = await response.json();
```

### 3. Payment Status Update (Webhook)

**Endpoint:** `POST /payment/responseStatus`

**Description:** Webhook endpoint for payment status updates from ArifPay

**Request Body:**

```typescript
{
  uuid?: string;            // Unique identifier
  nonce?: string;           // Payment nonce
  phone?: number;           // User's phone number
  transactionStatus?: PaymentStatus; // Payment status
  paymentStatus?: string;   // Payment status string
  totalAmount?: number;     // Total amount
  transaction?: {           // Transaction details
    transactionId: string;
    transactionStatus: string;
  };
  notificationUrl?: string; // Notification URL
  sessionId?: string;       // Session ID
}
```

**Payment Status Values:**

```typescript
enum PaymentStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  UNAUTHORIZED = 'unauthorized',
  SUCCESS = 'SUCCESS',
}
```

## Stripe Integration

### Base URL

```
POST /stripe/stripe-checkout
```

### Create Stripe Checkout Session

**Endpoint:** `POST /stripe/stripe-checkout`

**Description:** Creates a Stripe checkout session for international payments using predefined subscription plans

**Request Body:**

```typescript
{
  items: {
    price: string; // Stripe price ID (see available price IDs below)
    quantity: number; // Quantity (usually 1 for subscriptions)
  }[] | {
    price: string;
    quantity: number;
  }; // Can be array or single object
  successUrl: string; // Success redirect URL
  cancelUrl: string; // Cancel redirect URL
  userId: string; // User ID
}
```

**Available Stripe Price IDs:**

```typescript
// Subscription Plans with Price IDs
const STRIPE_PRICES = {
  STARTER: {
    MONTHLY: 'price_1RsJs2HV96pYRflDnFDyFqDC', // $6.99/month
    ANNUAL: 'price_1RsJs2HV96pYRflDogCR9iJB', // $59.99/year
  },
  BUILDER: {
    MONTHLY: 'price_1RsJumHV96pYRflDWJ1cr5oQ', // $6.99/month
    ANNUAL: 'price_1RsJvBHV96pYRflD6Sm8L5E4', // $89.88/year
  },
  PRO_BUNDLE: {
    MONTHLY: 'price_1RsJxXHV96pYRflDmXhgrab0', // $13.99/month
    ANNUAL: 'price_1RsJxsHV96pYRflDYEo4PouB', // $119.99/year
  },
};
```

**Response:**

```typescript
{
  sessionId: string; // Stripe session ID
  url: string; // Checkout URL to redirect user to
}
```

**Example Request:**

```javascript
// Single subscription
const response = await fetch('/stripe/stripe-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: {
      price: 'price_1RsJs2HV96pYRflDnFDyFqDC', // Starter Monthly
      quantity: 1,
    },
    successUrl:
      'https://yourapp.com/payment/success?plan=starter&billing=monthly',
    cancelUrl: 'https://yourapp.com/payment/cancel',
    userId: 'user_123456789',
  }),
});

// Multiple items (if needed)
const response2 = await fetch('/stripe/stripe-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      {
        price: 'price_1RsJxXHV96pYRflDmXhgrab0', // Pro Bundle Monthly
        quantity: 1,
      },
    ],
    successUrl:
      'https://yourapp.com/payment/success?plan=probundle&billing=monthly',
    cancelUrl: 'https://yourapp.com/payment/cancel',
    userId: 'user_123456789',
  }),
});
```

## URL Structure

### Understanding Success, Cancel, and Notify URLs

The payment system requires three types of URLs for proper payment flow handling:

#### 1. **Success URL** (`successUrl`)

- **Purpose**: Where users are redirected after successful payment
- **When called**: After user completes payment successfully
- **Parameters**: May include query parameters with payment details
- **Example**: `https://yourapp.com/payment/success?plan=starter&billing=monthly&session_id=cs_123`
- **Frontend action**: Show success message, activate subscription, redirect to dashboard

#### 2. **Cancel URL** (`cancelUrl`)

- **Purpose**: Where users are redirected when they cancel the payment
- **When called**: When user clicks "Cancel" or "Back" during payment process
- **Parameters**: Usually no special parameters
- **Example**: `https://yourapp.com/payment/cancel`
- **Frontend action**: Show cancellation message, return to pricing page

#### 3. **Notify URL** (`notifyUrl`) - **Webhook**

- **Purpose**: Server-to-server callback for payment status updates
- **When called**: When payment status changes (success, failure, etc.)
- **Method**: POST request from payment gateway to your server
- **Example**: `https://yourapp.com/api/payment/webhook`
- **Backend action**: Update payment status in database, trigger subscription creation

#### 4. **Error URL** (`errorUrl`) - **ArifPay Only**

- **Purpose**: Where users are redirected when payment fails
- **When called**: When payment processing encounters an error
- **Example**: `https://yourapp.com/payment/error`
- **Frontend action**: Show error message, allow retry

### URL Best Practices

```javascript
// Recommended URL structure
const paymentUrls = {
  successUrl: `${FRONTEND_URL}/payment/success?plan=${planName}&billing=${billingCycle}`,
  cancelUrl: `${FRONTEND_URL}/payment/cancel`,
  errorUrl: `${FRONTEND_URL}/payment/error`,
  notifyUrl: `${BACKEND_URL}/payment/responseStatus`, // Webhook endpoint
};

// For Stripe
const stripeUrls = {
  successUrl: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
  cancelUrl: `${FRONTEND_URL}/payment/cancel`,
  // Stripe webhooks are configured in Stripe dashboard
};
```

## Subscription Module

### Base URL

```
POST /subscriptions
GET /subscriptions
GET /subscriptions/:id
GET /subscriptions/user/:userId
PATCH /subscriptions/:id
DELETE /subscriptions/:id
GET /subscriptions/status/:status
GET /subscriptions/plan/:planName
GET /subscriptions/active/all
GET /subscriptions/expiring
```

### 1. Create Subscription

**Endpoint:** `POST /subscriptions`

**Description:** Creates a new subscription for a user

**Request Body:**

```typescript
{
  userId: string;           // User ID (string from better-auth)
  planName: SubscriptionPlan; // Subscription plan
  status?: SubscriptionStatus; // Subscription status (optional)
  startDate: Date;          // Subscription start date
  endDate: Date;            // Subscription end date
  autoRenew?: boolean;      // Auto-renewal flag (optional)
  price: number;            // Subscription price
  currency?: string;        // Currency (optional, default: USD)
  billingCycle: BillingCycle; // Billing cycle
  features?: string[];      // Plan features (optional)
  lastPaymentDate?: Date;   // Last payment date (optional)
  nextBillingDate?: Date;   // Next billing date (optional)
  trialEndsAt?: Date;       // Trial end date (optional)
  cancelAtPeriodEnd?: boolean; // Cancel at period end (optional)
}
```

**Subscription Plans:**

```typescript
enum SubscriptionPlan {
  FREE = 'Free',
  STARTER = 'Starter',
  BUILDER = 'Builder',
  PRO_BUNDLE = 'Pro-Bundle',
  ORGANIZATION = 'Organization',
}
```

**Subscription Status:**

```typescript
enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}
```

**Billing Cycles:**

```typescript
enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}
```

**Example Request:**

```javascript
const response = await fetch('/subscriptions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user_123456789',
    planName: 'Starter',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    price: 29.99,
    billingCycle: 'monthly',
    features: ['Basic access', 'Email support'],
    autoRenew: true,
  }),
});
```

### 2. Get All Subscriptions

**Endpoint:** `GET /subscriptions`

**Description:** Retrieves all subscriptions

### 3. Get Subscription by ID

**Endpoint:** `GET /subscriptions/:id`

**Description:** Retrieves a specific subscription by ID

### 4. Get User Subscriptions

**Endpoint:** `GET /subscriptions/user/:userId`

**Description:** Retrieves all subscriptions for a specific user

### 5. Update Subscription

**Endpoint:** `PATCH /subscriptions/:id`

**Description:** Updates a subscription

**Request Body:** Same as CreateSubscriptionDto (all fields optional)

### 6. Delete Subscription

**Endpoint:** `DELETE /subscriptions/:id`

**Description:** Deletes a subscription

### 7. Get Subscriptions by Status

**Endpoint:** `GET /subscriptions/status/:status`

**Description:** Retrieves subscriptions by status (active, canceled, expired, trial)

### 8. Get Subscriptions by Plan

**Endpoint:** `GET /subscriptions/plan/:planName`

**Description:** Retrieves subscriptions by plan name

### 9. Get Active Subscriptions

**Endpoint:** `GET /subscriptions/active/all`

**Description:** Retrieves all active subscriptions

### 10. Get Expiring Subscriptions

**Endpoint:** `GET /subscriptions/expiring?days=7`

**Description:** Retrieves subscriptions expiring within specified days

## Integration Flow

### Complete Payment to Subscription Flow

#### ArifPay Integration Flow (Ethiopian Users)

1. **Create ArifPay Payment Session**

   ```javascript
   // Step 1: Create ArifPay payment session
   const paymentResponse = await fetch('/payment', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'user_123456789',
       amount: 999, // Amount in cents/birr
       phone: 251912345678, // REQUIRED - Ethiopian phone number
       cancelUrl: 'https://yourapp.com/payment/cancel',
       successUrl:
         'https://yourapp.com/payment/success?plan=builder&billing=monthly',
       errorUrl: 'https://yourapp.com/payment/error',
       notifyUrl: 'https://yourapp.com/api/payment/webhook',
       email: 'user@example.com',
       paymentMethods: ['TELEBIRR', 'AWASH', 'AWASH_WALLET', 'CBE', 'AMOLE'],
       expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
       items: [
         {
           name: 'Builder Plan',
           quantity: 1,
           price: 999,
           description: 'Builder subscription - monthly billing',
         },
       ],
     }),
   });

   const { sessionId, transactionId, paymentUrl, cancelUrl } =
     await paymentResponse.json();
   ```

2. **Redirect User to ArifPay**

   ```javascript
   // Step 2: Redirect user to ArifPay payment page
   window.location.href = paymentUrl;
   ```

3. **Handle Webhook Notification**

   ```javascript
   // Step 3: Your backend receives webhook at /payment/responseStatus
   // This happens automatically when payment status changes
   // The webhook handler will update payment status in database
   ```

4. **Handle Success Page**

   ```javascript
   // Step 4: On success page, create subscription
   // Extract plan info from URL parameters
   const urlParams = new URLSearchParams(window.location.search);
   const plan = urlParams.get('plan');
   const billing = urlParams.get('billing');

   const subscriptionResponse = await fetch('/subscriptions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'user_123456789',
       planName: plan.toUpperCase(), // 'BUILDER'
       startDate: new Date(),
       endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
       price: 999,
       billingCycle: billing, // 'monthly'
       autoRenew: true,
       status: 'active',
     }),
   });

   const subscription = await subscriptionResponse.json();
   ```

#### Stripe Integration Flow (International Users)

1. **Create Stripe Checkout Session**

   ```javascript
   // Step 1: Create Stripe checkout session with predefined price ID
   const stripeResponse = await fetch('/stripe/stripe-checkout', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       items: {
         price: 'price_1RsJs2HV96pYRflDnFDyFqDC', // Starter Monthly - $6.99
         quantity: 1,
       },
       successUrl:
         'https://yourapp.com/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=starter&billing=monthly',
       cancelUrl: 'https://yourapp.com/payment/cancel',
       userId: 'user_123456789',
     }),
   });

   const { sessionId, url } = await stripeResponse.json();
   ```

2. **Redirect User to Stripe**

   ```javascript
   // Step 2: Redirect user to Stripe checkout page
   window.location.href = url;
   ```

3. **Handle Success Page**

   ```javascript
   // Step 3: On success page, verify payment and create subscription
   const urlParams = new URLSearchParams(window.location.search);
   const sessionId = urlParams.get('session_id');
   const plan = urlParams.get('plan');
   const billing = urlParams.get('billing');

   // Verify payment with Stripe (optional, but recommended)
   const verifyResponse = await fetch('/stripe/verify-session', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ sessionId }),
   });

   if (verifyResponse.ok) {
     // Create subscription after successful payment
     const subscriptionResponse = await fetch('/subscriptions', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         userId: 'user_123456789',
         planName: plan.toUpperCase(), // 'STARTER'
         startDate: new Date(),
         endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
         price: 6.99, // Price in USD
         currency: 'USD',
         billingCycle: billing, // 'monthly'
         autoRenew: true,
         status: 'active',
       }),
     });

     const subscription = await subscriptionResponse.json();
   }
   ```

### Complete Integration Example

```javascript
// Frontend payment selection logic
const initiatePayment = async (planName, billingCycle, userLocation) => {
  const user = getCurrentUser();

  if (userLocation === 'ET') {
    // Ethiopian users - use ArifPay
    return initiateArifPayPayment(planName, billingCycle, user);
  } else {
    // International users - use Stripe
    return initiateStripePayment(planName, billingCycle, user);
  }
};

const initiateArifPayPayment = async (planName, billingCycle, user) => {
  const planPrices = {
    starter: { monthly: 999, annual: 9999 },
    builder: { monthly: 999, annual: 9999 },
    probundle: { monthly: 1999, annual: 19999 },
  };

  const amount = planPrices[planName][billingCycle];

  const response = await fetch('/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      amount: amount,
      phone: user.phone, // REQUIRED for ArifPay
      email: user.email,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      successUrl: `${window.location.origin}/payment/success?plan=${planName}&billing=${billingCycle}`,
      errorUrl: `${window.location.origin}/payment/error`,
      notifyUrl: `${API_BASE_URL}/payment/responseStatus`,
      paymentMethods: ['TELEBIRR', 'AWASH', 'AWASH_WALLET', 'CBE', 'AMOLE'],
      expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      items: [
        {
          name: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`,
          quantity: 1,
          price: amount,
          description: `${planName} subscription - ${billingCycle} billing`,
        },
      ],
    }),
  });

  const { paymentUrl } = await response.json();
  window.location.href = paymentUrl;
};

const initiateStripePayment = async (planName, billingCycle, user) => {
  const stripePrices = {
    starter: {
      monthly: 'price_1RsJs2HV96pYRflDnFDyFqDC',
      annual: 'price_1RsJs2HV96pYRflDogCR9iJB',
    },
    builder: {
      monthly: 'price_1RsJumHV96pYRflDWJ1cr5oQ',
      annual: 'price_1RsJvBHV96pYRflD6Sm8L5E4',
    },
    probundle: {
      monthly: 'price_1RsJxXHV96pYRflDmXhgrab0',
      annual: 'price_1RsJxsHV96pYRflDYEo4PouB',
    },
  };

  const priceId = stripePrices[planName][billingCycle];

  const response = await fetch('/stripe/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: { price: priceId, quantity: 1 },
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}&billing=${billingCycle}`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      userId: user.id,
    }),
  });

  const { url } = await response.json();
  window.location.href = url;
};
```

## Error Handling

### Common Error Responses

**400 Bad Request - Missing Phone:**

```json
{
  "statusCode": 400,
  "message": "Missing required fields: phone",
  "error": "Validation failed"
}
```

**400 Bad Request - Payment Creation Failed:**

```json
{
  "statusCode": 400,
  "message": "Failed to create payment session after multiple attempts",
  "error": {
    "details": "Missing required fields: phone",
    "code": "PAYMENT_CREATION_FAILED",
    "userId": "user_123456789"
  }
}
```

**400 Bad Request - General Validation:**

```json
{
  "statusCode": 400,
  "message": "Invalid payment data",
  "error": "Validation failed"
}
```

**404 Not Found:**

```json
{
  "statusCode": 404,
  "message": "Payment not found",
  "data": null
}
```

**500 Internal Server Error:**

```json
{
  "statusCode": 500,
  "message": "Failed to create payment session",
  "error": "Payment gateway error"
}
```

### Frontend Error Handling

```javascript
try {
  const response = await fetch('/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  console.error('Payment error:', error.message);
  // Handle error (show user-friendly message)
}
```

## Environment Variables

### Required Environment Variables

```bash
# ArifPay Configuration
ARIFPAY_API_KEY=your_arifpay_api_key_here
API_KEY=your_arifpay_api_key_here  # Alternative key name (auto-set by system)
PAYMENT_BENEFICIARIES={"accountNumber":"1000651652956","bank":"CBETETAA","amount":2}

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51234567890abcdef...  # Your Stripe secret key

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/beblocky

# API Configuration
PORT=8000
NODE_ENV=development
```

### Optional Environment Variables

```bash
# URL Overrides (if not using dynamic URLs)
CANCEL_URL=https://yourapp.com/payment/cancel
SUCCESS_URL=https://yourapp.com/payment/success
ERROR_URL=https://yourapp.com/payment/error
NOTIFY_URL=https://yourapp.com/api/payment/webhook

# ArifPay Legacy Configuration (deprecated)
ARIFPAY_BENEFICIARY_ACCOUNT=1000651652956
ARIFPAY_BENEFICIARY_BANK=CBETETAA

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Environment Setup Notes

1. **ArifPay API Key**: The system automatically sets `API_KEY` from `ARIFPAY_API_KEY` if not present
2. **Beneficiaries**: Must be valid JSON format with `accountNumber`, `bank`, and `amount` fields
3. **Stripe Keys**: Use test keys for development, live keys for production
4. **URLs**: Can be set via environment variables or passed dynamically in requests

## Best Practices

1. **Always include the phone field** - ArifPay requires a valid Ethiopian phone number
2. **Use correct phone number format** - Ethiopian format: `251912345678` (country code + 9 digits)
3. **Always validate payment responses** before creating subscriptions
4. **Implement proper error handling** for all payment operations
5. **Use webhooks** for payment status updates rather than polling
6. **Store payment session IDs** for tracking and reconciliation
7. **Implement retry logic** for failed payment operations
8. **Use HTTPS** for all payment-related communications
9. **Validate user permissions** before allowing subscription operations
10. **Implement proper logging** for debugging payment issues
11. **Handle payment method mapping** - The API automatically maps payment methods to ArifPay format

## Testing

### Test Payment Flow

1. Use test credentials for ArifPay and Stripe
2. Test all payment methods and scenarios
3. Verify webhook handling
4. Test subscription creation after successful payment
5. Test error scenarios and edge cases

### Test Data

```javascript
// Test payment data
const testPayment = {
  userId: 'test_user_123',
  amount: 100,
  phone: 251912345678, // REQUIRED - Ethiopian phone number
  cancelUrl: 'http://localhost:3000/cancel',
  successUrl: 'http://localhost:3000/success',
  errorUrl: 'http://localhost:3000/error',
  notifyUrl: 'http://localhost:3000/webhook',
  email: 'test@example.com',
  paymentMethods: ['TELEBIRR', 'AWASH', 'CBE'],
  expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  items: [
    {
      name: 'Test Item',
      quantity: 1,
      price: 100,
      description: 'Test item for payment',
    },
  ],
};
```

## Debugging & Troubleshooting

### Common Issues

#### 1. **Missing Phone Field Error**

```
❌ [ArifPay Debug] Attempt 1 failed: Missing required fields: phone
```

**Solution:** Always include the `phone` field in your payment request with a valid Ethiopian phone number format.

#### 2. **Invalid Payment Methods**

The API automatically maps payment methods to ArifPay format:

- `AWASH` → `AWASH_BIRR`
- `CBE` → `CBE_BIRR`
- `BOA` → `BOA_BIRR`

#### 3. **Duplicate Session ID Error**

```
MongoServerError: E11000 duplicate key error collection: beblocky.payments index: sessionId_1 dup key: { sessionId: null }
```

**Solution:** This has been fixed in the latest version. The API now prevents saving failed payments with null session IDs.

### Debug Endpoints

#### Test Configuration

```bash
GET /payment/test/config
```

Returns:

```json
{
  "status": "success",
  "message": "Configuration loaded successfully",
  "beneficiaries": {
    "accountNumber": "1000651652956",
    "bank": "CBETETAA",
    "amount": 2
  },
  "hasArifPayKey": true,
  "hasBeneficiaries": true
}
```

### Debug Logs

The API now includes comprehensive debug logging. Check your server console for:

- `🔍 [ArifPay Debug] Request Payload:` - Shows the exact payload sent to ArifPay
- `🔍 [ArifPay Debug] Beneficiaries:` - Shows the beneficiaries configuration
- `❌ [ArifPay Debug] Attempt X failed:` - Shows detailed error information

### Environment Variables Check

Ensure these environment variables are set correctly:

```bash
ARIFPAY_API_KEY=your_arifpay_api_key
PAYMENT_BENEFICIARIES={"accountNumber":"1000651652956","bank":"CBETETAA","amount":2}
```

This guide provides everything needed to integrate the payment and subscription systems with your frontend application.
