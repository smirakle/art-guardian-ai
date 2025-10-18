# Critical User Flow Testing Guide

## Test 1: Authentication Flow

### Sign Up
1. Go to `/auth`
2. Enter email, password, full name, username
3. Click "Sign Up"
4. **Expected**: Success message, verification email sent
5. Check email inbox
6. Click verification link
7. **Expected**: Redirect to dashboard

### Login
1. Go to `/auth`
2. Enter verified email and password
3. Click "Login"
4. **Expected**: Redirect to dashboard
5. Check user is authenticated

### Password Reset
1. Click "Forgot Password"
2. Enter email
3. **Expected**: Reset email sent
4. Click reset link
5. Enter new password
6. **Expected**: Can login with new password

---

## Test 2: Protection Flow

### Upload Artwork
1. Login
2. Go to `/upload`
3. Select image/video file
4. Fill title, description, category
5. Click "Upload"
6. **Expected**: Success message, artwork appears in dashboard

### Apply AI Protection
1. Go to dashboard
2. Select uploaded artwork
3. Click "Apply AI Protection"
4. **Expected**: Protection processing starts
5. Wait for completion
6. **Expected**: Status changes to "Protected"

### Blockchain Registration
1. Select protected artwork
2. Click "Register on Blockchain"
3. **Expected**: Transaction initiated
4. Wait for confirmation
5. **Expected**: Certificate generated

---

## Test 3: Subscription Flow

### View Pricing
1. Go to `/pricing`
2. **Expected**: All plans visible with features

### Apply Promo Code
1. Enter `BETA200` in promo field
2. **Expected**: 30% discount applied to price

### Checkout (Test Mode)
1. Click "Upgrade to Professional"
2. **Expected**: Redirect to Stripe checkout
3. Enter test card: `4242 4242 4242 4242`
4. **Expected**: Payment succeeds
5. Check subscription status
6. **Expected**: Status = "active", plan = "professional"

---

## Test 4: Bug Report Flow

1. Click "Report Bug" button
2. Fill subject, description
3. Click "Submit"
4. **Expected**: Success message
5. Check shirleena.cunningham@tsmowatch.com
6. **Expected**: Bug report email received
