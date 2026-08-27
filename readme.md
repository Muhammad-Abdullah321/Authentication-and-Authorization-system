# Authentication API

An Express 5 and MongoDB backend that provides user registration, email OTP verification, password login, JWT-based sessions, Google/GitHub OAuth, password reset, protected todo management, and Stripe subscriptions.

## Features

- Local registration with a six-digit email OTP that expires after five minutes.
- Password hashing with `bcryptjs`.
- JWT access tokens that expire after 15 minutes.
- JWT refresh tokens that expire after seven days and are stored in an HTTP-only cookie and as a bcrypt hash in MongoDB.
- Login, refresh-token, and logout flows.
- Google OAuth 2.0 and GitHub OAuth 2.0 through Passport.
- Password reset with a five-minute email OTP and five-minute reset token.
- Protected todo CRUD endpoints.
- Free and premium plans. Free users can create five todos per day; premium users can create 50.
- Stripe Checkout subscriptions, subscription cancellation, and webhook-driven plan updates.
- Request logging with Morgan and rate limiting on login and OTP/password-reset actions.

## Technology Stack

- Node.js with ECMAScript modules (`"type": "module"`)
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens with `jsonwebtoken`
- `bcryptjs` for password and refresh-token hashing
- Passport, `passport-google-oauth20`, and `passport-github2`
- Nodemailer with Gmail SMTP for OTP email delivery
- Stripe for subscription billing
- `cookie-parser`, `morgan`, `express-rate-limit`, and `dotenv`

## Project Structure

```text
src/
├── app.js                         Express app and route registration
├── server.js                      Database connection and server startup
├── config/
│   ├── config.js                  MongoDB and JWT configuration
│   ├── google.pass.config.js      Google Passport strategy
│   ├── github.passport.js         GitHub Passport strategy
│   └── stripe.config.js           Stripe client
├── Controllers/                   Request handlers
├── Middleware/
│   ├── auth.middleware.js         Bearer access-token verification
│   └── ratelimit.middleware.js   Five requests per 15 minutes
├── Models/                        Mongoose models
├── routes/                        API route definitions
└── utils/sendOtp.js               Gmail OTP sender
```

## Requirements

- Node.js 18 or later
- MongoDB, either locally or through MongoDB Atlas
- Gmail credentials suitable for SMTP, if using local registration or password reset
- Google and/or GitHub OAuth applications, if using social login
- A Stripe account and recurring Price ID, if using subscriptions

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URL=mongodb://127.0.0.1:27017/authentication
JWT_SECRET=replace_with_a_long_random_secret

EMAIL_USER=your-gmail-address@example.com
EMAIL_PASS=your-gmail-app-password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALL_BACK_URL=http://localhost:3000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALL_BACK_URL=http://localhost:3000/api/auth/github/callback

STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PRICE_ID=price_your_recurring_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:5173
```

`MONGO_URL` and `JWT_SECRET` are required during startup. Use a Gmail App Password rather than a normal Gmail password when two-step verification is enabled. Never commit `.env` or real credentials.

## Running the API

```bash
npm run dev
```

The API listens on `http://localhost:3000`. There is currently no production `start` script; start the application with `node src/server.js` when needed.

## Authentication

After a successful local login or OAuth login, use the returned access token on protected requests:

```http
Authorization: Bearer <access-token>
```

The refresh token is also issued in the `refreshToken` HTTP-only cookie. The local login response currently includes the refresh token in JSON as well. Access tokens are short-lived, so call `/api/auth/refreshToken` with the cookie to obtain a new access token.

For browser clients, send cookies with requests, for example with `credentials: "include"` in `fetch`.

## API Endpoints

Base URL: `http://localhost:3000`

### Authentication: `/api/auth`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | No | Start registration and send an OTP. Body: `firstName`, `lastName`, `username`, `email`, `password` |
| POST | `/verifyOTP` | No | Complete registration. Body: `email`, `otp` |
| POST | `/login` | No | Login with `username` and `password` |
| POST | `/refreshToken` | Cookie | Return a new access token |
| POST | `/logout` | Cookie | Delete the user sessions and clear the refresh cookie |
| GET | `/google` | No | Start Google OAuth |
| GET | `/google/callback` | No | Google OAuth callback |
| GET | `/github` | No | Start GitHub OAuth |
| GET | `/github/callback` | No | GitHub OAuth callback |
| POST | `/forgetPassword` | No | Send a password-reset OTP. Body: `email` |
| POST | `/verifyforgetpassOtp` | No | Verify reset OTP. Body: `email`, `otp` |
| POST | `/resetPassword` | No | Reset password. Body: `newpassword`, `conformpassword`, `resetToken` |

The rate limiter allows five requests per 15-minute window for login, registration OTP verification, and password-reset OTP operations.

### Todos: `/api/todos`

All todo endpoints require a Bearer access token.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/` | Create a todo. Body: `title`, optional `description` |
| GET | `/` | Return the authenticated user's todos |
| PUT | `/:id` | Update `title`, `description`, and/or `completed` |
| DELETE | `/:id` | Delete a todo owned by the authenticated user |

Todo creation is limited to five per day on the `free` plan and 50 per day on the `premium` plan.

### Subscriptions: `/api/subscription`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | Bearer token | Return the current user's plan |
| POST | `/checkout` | Bearer token | Create a Stripe Checkout subscription session and return its URL |
| POST | `/cancel` | Bearer token | Schedule the current subscription to cancel at period end |
| POST | `/webhook` | Stripe signature | Process Stripe subscription events |

Configure the Stripe webhook endpoint as `http://localhost:3000/api/subscription/webhook`. The webhook updates users for `checkout.session.completed` and `customer.subscription.deleted` events. For local development, Stripe CLI can forward events:

```bash
stripe listen --forward-to localhost:3000/api/subscription/webhook
```

## Data Models

- `User`: profile, credentials/provider IDs, verification state, plan, and Stripe subscription IDs.
- `OTP`: temporary registration data and hashed OTP with an expiry time.
- `passwordResetOtp`: hashed password-reset OTP and expiry time.
- `session`: hashed refresh token, user ID, IP address, user agent, revocation state, and timestamps.
- `Todo`: user-owned todo title, description, completion state, and creation timestamp.

## Security Notes

- Passwords and stored refresh tokens are hashed with bcrypt.
- OTP values are stored as hashes and expire after five minutes.
- Keep `JWT_SECRET`, OAuth secrets, SMTP credentials, and Stripe keys outside source control.
- Set the refresh cookie's `secure` option to `true` behind HTTPS in production and configure an appropriate cross-origin policy for the frontend.
- Use a production process manager and a production startup script when deploying.

## Current Limitations

- The project does not currently include automated tests (`npm test` is a placeholder that exits with an error).
- The server port is hard-coded to `3000` rather than read from an environment variable.
- OAuth callback behavior depends on the provider returning an email address.
- Subscription state is updated through Stripe webhooks, so the webhook must be reachable and configured for premium access to be reflected.
