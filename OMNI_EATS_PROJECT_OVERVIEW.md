# Omni Eats - Project Overview & Business Plan Guide

## 1. Project Overview

**Omni Eats** is a full-stack food delivery platform built for the South African market. It connects customers, local restaurants, and delivery drivers in one seamless ecosystem. The platform supports multiple user roles, online payments (PayFast & Stripe), and comprehensive dashboard management.

### Important Note for iOS/iPhone Users
- **Android**: Uses `.apk` files - users can download and install directly (if "Unknown Sources" is enabled)
- **iOS (iPhone)**: Does NOT use `.apk` files! iOS apps use `.ipa` files, and you CANNOT just download and install them directly like Android!
  - For iOS, you need to use **TestFlight** (for beta testing) or submit to the **App Store** (for public release)
  - You need an **Apple Developer Account** ($99/year) to use TestFlight and App Store
  - You also need a **Mac** (with Xcode) to build and sign iOS apps!

---

## 2. Core Features

### 2.1 User Roles
- **Customers**: Browse restaurants, view menus, place orders, track deliveries, save favorites, leave reviews
- **Restaurant Owners**: Manage restaurants, menus, orders, view reports/sales analytics
- **Drivers**: Accept and fulfill deliveries, track earnings
- **Admins**: Approve/reject restaurants, manage users, moderate content, view platform-wide reports

### 2.2 Key Features
- **Restaurant Discovery**: Search, filter by cuisine/dietary options, view ratings
- **Menu Management**: Create/edit menu items, categories, pricing
- **Order Management**: Order tracking (status updates from PENDING → DELIVERED), order history
- **Payments**: Integration with PayFast (South African payment gateway) and Stripe
- **Favorites**: Save preferred restaurants
- **Reviews & Ratings**: Leave feedback on restaurants
- **User Authentication**: NextAuth.js for secure login/registration, password reset
- **Reports & Analytics**: Download sales reports (CSV, PDF, DOCX) for restaurants, drivers, admins
- **Notifications**: In-app notifications for order updates
- **Responsive Design**: Mobile-first, optimized for all devices
- **PWA Support**: Progressive Web App capabilities for offline access
- **Mobile App**: Capacitor integration for Android app deployment

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: Custom CSS Modules, Lucide React for icons
- **State Management**: React Context API (Cart, Auth, Theme)
- **Maps/Address**: Google Places Autocomplete

### Backend
- **Database**: PostgreSQL (with Prisma ORM)
- **ORM**: Prisma 6
- **Auth**: NextAuth.js 5 (beta)
- **Payment Gateways**: PayFast, Stripe
- **Email**: Resend (for password resets, notifications)
- **File Handling**: File uploads for restaurant/menu images

### DevOps & Tools
- **Deployment**: Vercel-ready
- **Mobile**: Capacitor (for Android native app)
- **PWA**: @ducanh2912/next-pwa

---

## 4. Data Model (Prisma Schema)

### Core Entities
1. **User**: id, email, name, password, phone, role (USER/RESTAURANT_OWNER/DRIVER/ADMIN), addresses, favorites, orders, deliveries, restaurants, reviews
2. **Restaurant**: id, name, description, imageUrl, rating, deliveryTime, cuisineType, dietaryOptions, ownerId, status (PENDING/APPROVED/REJECTED), isOpen, deliveryAvailable, address, menuItems, reviews, favorites
3. **MenuItem**: id, name, description, price, imageUrl, category, restaurantId, orderItems
4. **Order**: id, userId, driverId, status (PENDING/CONFIRMED/PREPARING/OUT_FOR_DELIVERY/DELIVERED), deliveryType, total, paymentStatus, promoCode, discount, addressId, deliveryAddress, items, payment
5. **OrderItem**: id, orderId, menuItemId, quantity, price
6. **Review**: id, userId, restaurantId, rating, comment, helpful
7. **Favorite**: id, userId, restaurantId (unique composite key)
8. **Address**: id, userId, label, street, city, province, postalCode, isDefault
9. **Promotion**: id, code, description, discount, discountType, minOrder, maxDiscount, usageLimit, usageCount, expiresAt, isActive
10. **Payment**: id, orderId, amount, status, paymentMethod, payfastPaymentId
11. **Notification**: id, userId, title, message, type, isRead

---

## 5. Monetization Strategies

Here are several ways to monetize Omni Eats:

### 5.1 Commission on Orders
- **Description**: Charge restaurants a percentage commission (10-25%) on every order placed through the platform
- **Implementation**: Calculate commission automatically in the backend when an order is completed
- **Why It Works**: Proven model used by Uber Eats, Mr D Food, etc. Restaurants only pay when they make sales

### 5.2 Delivery Fees
- **Description**: Charge customers a delivery fee (fixed or distance-based) for each delivery order
- **Implementation**: Add delivery fee line item to order total
- **Why It Works**: Covers driver costs while still being competitive

### 5.3 Restaurant Subscription Plans
- **Description**: Offer tiered subscription plans for restaurants
  - **Basic**: Free or low cost, limited features
  - **Pro**: Monthly fee (R199-R499), priority listing, featured placement, analytics
  - **Premium**: Higher fee, custom branding, dedicated support
- **Implementation**: Add subscription tier to Restaurant model, restrict features based on tier

### 5.4 Featured Listings & Advertising
- **Description**: Sell featured placement on the homepage, search results, or category pages
- **Implementation**: Create FeaturedListing model, charge daily/weekly/monthly fees
- **Why It Works**: Restaurants pay for increased visibility

### 5.5 Promotions & Discounts (Revenue Share)
- **Description**: Restaurants can run promotions through the platform, with Omni Eats taking a small cut
- **Implementation**: Use Promotion model, track discount usage and revenue share

### 5.6 Driver Onboarding/Subscription Fees
- **Description**: Charge drivers a small onboarding fee or monthly subscription for access to the platform
- **Why It Works**: Ensures only serious drivers join, covers platform costs

### 5.7 White Label Solutions
- **Description**: License the Omni Eats platform to other entrepreneurs/regions as a white-label product
- **Implementation**: Offer custom branding, domain, and support packages

---

## 6. Business Plan Outline

### 6.1 Executive Summary
- **Mission**: To connect South African communities with local food, supporting small businesses and creating job opportunities for drivers
- **Vision**: To become the leading food delivery platform in townships and rural areas of South Africa
- **Unique Value Proposition (UVP)**: Focus on local, township-based restaurants, affordable delivery, and community-focused approach

### 6.2 Market Analysis
- **Target Market**: 
  - Customers: Residents in townships and urban areas
  - Restaurants: Local, family-owned, township-based establishments
  - Drivers: Local community members looking for flexible income
- **Market Size**: South African food delivery market was valued at ~R15 billion in 2024 (source: industry reports)
- **Competitors**: Uber Eats, Mr D Food, Bolt Food – but they often neglect township areas

### 6.3 Marketing & Growth Strategy
- **Phase 1 (Launch)**: 
  - Partner with 10-20 local restaurants in one township
  - Onboard 20-30 local drivers
  - Offer launch promotions (free delivery, discount codes)
  - Social media marketing (Facebook, Instagram, TikTok) targeting local communities
- **Phase 2 (Growth)**:
  - Expand to neighboring townships
  - Launch referral program (refer a friend, get R50 off your next order)
  - Partner with local influencers and community leaders
- **Phase 3 (Scale)**:
  - Expand to multiple cities/provinces
  - Launch mobile app marketing campaign
  - Corporate partnerships (employee meal benefits)

### 6.4 Operations Plan
- **Restaurant Onboarding**: Streamlined registration process, admin approval workflow
- **Driver Onboarding**: Background checks, training, app orientation
- **Customer Support**: WhatsApp support (popular in SA), email, in-app chat
- **Quality Control**: Review system, restaurant ratings, driver ratings

### 6.5 Financial Plan
- **Startup Costs**:
  - Development & hosting: R50,000 - R100,000
  - Marketing: R30,000 - R50,000
  - Legal & admin: R10,000 - R20,000
  - Contingency: R20,000
  - **Total**: ~R120,000 - R200,000
- **Revenue Projections (Year 1)**:
  - Assume 50 restaurants, 100 drivers, 5000 customers
  - Average order value: R150
  - 10 orders/day per restaurant: 500 orders/day total
  - Commission: 15% = R22.50 per order
  - **Monthly Revenue**: R22.50 × 500 × 30 = R337,500
  - **Annual Revenue**: ~R4 million
- **Profit Margin**: Aim for 15-20% net profit margin after Year 2

---

## 7. How to Run the Project

### Prerequisites
- Node.js 20+
- PostgreSQL database (or use SQLite for local development)
- npm or yarn
- **For iOS**: Mac with Xcode, Apple Developer Account ($99/year)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env` and fill in)
4. Push database schema: `npm run db:push`
5. Seed the database: `npm run db:seed`
6. Start development server: `npm run dev`

### Default Login Credentials (from seed)
- **Customer**: `customer@example.com` / `password123`
- **Restaurant Owner**: `soweto@example.com` / `password123` (or maxs@example.com, durban@example.com, kota@example.com)
- **Driver**: `driver@example.com` / `password123`
- **Admin**: Check `prisma/seed.ts` or create one via API

---

## 8. Mobile App Setup (Android & iOS)

### Android Setup
1. Build the Next.js app first: `npm run build`
2. Add Android platform (if not already added): `npm run cap:android`
3. Sync web assets: `npm run cap:sync`
4. Open in Android Studio: `npm run cap:open:android`
5. Build APK/AAB in Android Studio!

### iOS Setup (Requires a Mac!
1. Build the Next.js app first: `npm run build`
2. Install dependencies (we added `@capacitor/ios` to package.json!)
3. Add iOS platform: `npm run cap:ios`
4. Sync web assets: `npm run cap:sync`
5. Open in Xcode: `npm run cap:open:ios`
6. Configure your Apple Developer Team in Xcode (for signing)
7. For beta testing: Archive and upload to **App Store Connect** then use **TestFlight**
8. For public release: Submit to App Store!

---

## 9. Next Steps for Development

1. **Payment Integration**: Ensure PayFast and Stripe are fully configured with live credentials
2. **Mobile App**: Build out full Android & iOS apps using Capacitor
3. **Real-time Updates**: Add WebSockets for live order tracking and notifications
4. **Driver App**: Create dedicated driver app (or enhance driver dashboard)
5. **Marketing Features**: Add referral program, loyalty points, promo code management
6. **Analytics Dashboard**: Build better analytics for admins and restaurants
7. **Multi-language Support**: Add support for local languages (Zulu, Xhosa, Afrikaans)

---

## 10. Contact & Support

For questions about the project or business plan, refer to the codebase or contact the development team.

---

**Note**: This is a living document - update it as the project grows and evolves!
