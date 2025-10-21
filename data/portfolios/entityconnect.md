# ChurchConnect Platform - Portfolio

## 🎯 Project Overview

**ChurchConnect** is a comprehensive church management platform designed to help religious organizations manage their communities, events, communications, and administrative tasks efficiently. The platform consists of three interconnected applications that work together to provide a complete solution.

---

## 📱 Platform Components

### 1. ChurchConnect Mobile Application
**Repository:** [ChurchConnect-MOBILE-App](https://github.com/quaenet/ChurchConnect-MOBILE-App)

A feature-rich mobile application built with React Native, providing church members with seamless access to church activities, events, and community features on both iOS and Android devices.

#### **Tech Stack:**
- **Framework:** React Native 0.61.4
- **State Management:** Redux
- **Navigation:** React Navigation v4
- **UI Framework:** React Native UI Kitten, Eva Design System
- **Payment Integration:** Square In-App Payments
- **Push Notifications:** Firebase Cloud Messaging
- **Maps & Location:** React Native Geocoding, Open Maps
- **Camera & Media:** React Native Camera, Image Picker
- **Error Tracking:** Sentry

#### **Key Features:**
- 📅 Event Management & Calendar
- 💬 Real-time Messaging & Communications
- 💳 Integrated Payment Processing (Square)
- 📍 Location Services & Maps
- 📊 QR Code Scanning & Generation
- 🔔 Push Notifications
- 📄 PDF Document Viewing
- 🎨 Material Design UI Components
- 🔐 Secure Authentication

#### **Platforms Supported:**
- iOS (with CocoaPods integration)
- Android (Gradle build system)

#### **Branch:** `multitenancy.mina`

---

### 2. ChurchConnect Backend API
**Repository:** [ChurchConnect-sails-api](https://github.com/quaenet/ChurchConnect-sails-api)

A robust REST API built with Sails.js framework providing the backend logic and data management for the entire ChurchConnect ecosystem.

#### **Tech Stack:**
- **Framework:** Sails.js v1.2.4
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Email Services:** SendGrid, Nodemailer
- **File Storage:** AWS S3 (via Skipper)
- **Payment Processing:** Square Connect API
- **Maps Integration:** Google Maps Services
- **Task Scheduling:** Node Schedule
- **Error Tracking:** Sentry
- **Documentation:** Swagger/OpenAPI

#### **Key Features:**
- 🔐 Advanced Authentication & Authorization
- 👥 User & Role Management
- 📅 Event & Calendar Management
- 📧 Email Notifications & Communications
- 📁 File Upload & Storage (AWS S3)
- 💳 Payment Processing Integration
- 🔄 Database Migrations & Seeding
- 📊 CSV Import/Export
- 🔔 Firebase Push Notifications
- 📑 PDF Generation
- 🗺️ Geolocation Services
- 📱 QR Code Generation

#### **Database Management:**
- Sequelize ORM for database operations
- Migration system for schema versioning
- Seeders for initial data setup
- Support for Bible data seeding

#### **Branch:** `testing`

---

### 3. ChurchConnect Admin Web Portal
**Repository:** [ChurchConnect-Web-Portal](https://github.com/quaenet/ChurchConnect-Web-Portal)

A powerful administrative dashboard built with Angular, providing church administrators with comprehensive tools to manage all aspects of their organization.

#### **Tech Stack:**
- **Framework:** Angular 13
- **UI Framework:** Angular Material, DevExtreme, PrimeNG
- **State Management:** RxJS
- **Build Tool:** Webpack, Angular CLI
- **Rich Text Editor:** Summernote (via ngx-summernote)
- **Charts:** amCharts 5
- **Data Grid:** DevExtreme Data Grid
- **File Upload:** Uppy (with AWS S3 support)
- **Excel Operations:** ExcelJS
- **Date/Time:** Moment.js with Timezone support
- **Notifications:** ngx-toastr, SweetAlert2
- **Error Tracking:** Sentry
- **PWA Support:** Angular Service Worker

#### **Key Features:**
- 📊 Advanced Dashboard & Analytics
- 👥 Member & Household Management
- 📅 Event Creation & Management
- 📧 Communication Tools
- 💰 Financial Management
- 📈 Reporting & Data Export
- 🔐 Role-Based Access Control
- 📱 Progressive Web App (PWA)
- 🌐 Multi-tenant Support
- 📤 File Upload & Management
- 📊 Interactive Charts & Visualizations
- 🎨 Modern Material Design UI

#### **Administrative Capabilities:**
- User & permission management
- Event scheduling & calendar management
- Household & member tracking
- Financial transactions & giving records
- Communication & email campaigns
- Document management
- Data import/export (Excel, CSV)
- Custom reporting & analytics

#### **Branch:** `test`

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌──────────────┐              ┌──────────────┐   │
│  │   Mobile     │              │   Web Portal │   │
│  │  React Native│◄────────────►│   Angular    │   │
│  │  (iOS/Android│              │   (Admin)    │   │
│  └──────┬───────┘              └──────┬───────┘   │
│         │                              │           │
│         │         REST API             │           │
│         └──────────────┬───────────────┘           │
│                        │                           │
│                 ┌──────▼──────┐                    │
│                 │   Sails.js  │                    │
│                 │   Backend   │                    │
│                 │   API       │                    │
│                 └──────┬──────┘                    │
│                        │                           │
│         ┌──────────────┼──────────────┐            │
│         │              │              │            │
│    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐       │
│    │  MySQL  │   │   AWS   │   │Firebase │       │
│    │Database │   │   S3    │   │   FCM   │       │
│    └─────────┘   └─────────┘   └─────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Third-Party Integrations
- **Payment Processing:** Square API
- **Cloud Storage:** AWS S3
- **Email Services:** SendGrid
- **Push Notifications:** Firebase Cloud Messaging
- **Maps & Geolocation:** Google Maps API
- **Error Tracking:** Sentry
- **Authentication:** JWT

---

## 🚀 Getting Started

### Prerequisites
- Node.js v15.0.1 (Backend)
- npm or yarn
- MySQL Database
- AWS Account (for S3 storage)
- Firebase Account (for push notifications)
- Square Account (for payment processing)

### Mobile App Setup
```bash
# Clone the repository
git clone https://github.com/quaenet/ChurchConnect-MOBILE-App.git
cd ChurchConnect-MOBILE-App

# Install dependencies
npm install

# iOS specific
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Backend API Setup
```bash
# Clone the repository
git clone https://github.com/quaenet/ChurchConnect-sails-api.git
cd ChurchConnect-sails-api

# Install dependencies
yarn install --ignore-engines

# Setup environment
cp .env.default .env
# Configure DATABASE_URI and other variables

# Run migrations
sequelize db:migrate

# Start the server
npm start
```

### Web Portal Setup
```bash
# Clone the repository
git clone https://github.com/quaenet/ChurchConnect-Web-Portal.git
cd ChurchConnect-Web-Portal

# Install dependencies
npm install

# Configure proxy
cp proxy.config.default.json proxy.config.json
# Modify proxy.config.json to point to your API

# Start development server
npm start

# Build for production
npm run build
```

---

## 🔒 Security Features

- **Authentication:** JWT-based authentication system
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** Secure data transmission with HTTPS
- **Input Validation:** Server-side validation using Joi
- **SQL Injection Protection:** Sequelize ORM parameterized queries
- **XSS Protection:** Input sanitization
- **CORS:** Configured Cross-Origin Resource Sharing
- **Environment Variables:** Sensitive data stored securely

---

## 📊 Database Schema

The system uses MySQL database with Sequelize ORM, featuring:
- **Users & Authentication**
- **Churches & Organizations** (Multi-tenant support)
- **Members & Households**
- **Events & Calendar**
- **Donations & Financial Records**
- **Communications & Messages**
- **Files & Documents**
- **Roles & Permissions**

---

## 🧪 Development Workflow

### Version Control
- Git for source control
- GitHub for repository hosting
- Feature branch workflow
- Separate branches for development/testing/production

### Current Active Branches
- **Mobile:** `multitenancy.mina`
- **Backend:** `testing`
- **Web Portal:** `test`

### Code Quality
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- Jest for testing (Mobile & Backend)
- TypeScript for type safety (Web Portal)

---

## 📦 Deployment

### Mobile App
- **iOS:** App Store deployment via Xcode
- **Android:** Google Play Store via Gradle build
- Code Push for OTA updates
- Sentry for crash reporting

### Backend API
- Node.js server deployment
- Environment-based configuration
- Database migrations on deployment
- Load balancing capable

### Web Portal
- Angular production build
- PWA support for offline functionality
- Service Worker caching
- CDN distribution ready

---

## 🎨 Design & UX

### Mobile App
- Material Design principles
- Eva Design System
- Responsive layouts
- Native platform feel
- Dark mode support

### Web Portal
- Angular Material Design
- Responsive grid system
- Intuitive navigation
- Rich interactive components
- Accessible UI elements

---

## 📈 Performance Optimizations

### Mobile
- Image optimization
- Lazy loading
- Redux state management
- Native module optimization

### Backend
- Database query optimization
- Caching strategies
- Asynchronous processing
- Connection pooling

### Web Portal
- Lazy loading modules
- AOT compilation
- Tree shaking
- Service Worker caching

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Coding Standards
- Follow ESLint/TSLint configurations
- Write meaningful commit messages
- Document new features
- Add unit tests for new functionality

---

## 📝 Documentation

- API documentation available via Swagger UI
- Inline code documentation
- README files in each repository
- Setup and deployment guides

---

## 🔧 Maintenance & Support

### Monitoring
- Sentry for error tracking and performance monitoring
- Server logs for debugging
- Analytics for usage tracking

### Updates
- Regular dependency updates
- Security patches
- Feature enhancements
- Bug fixes

---

## 👨‍💻 Development Team

**Developed by:** QuaeNet Development Team
**Author:** @mohabmaroo

---

## 📄 License

Private - All rights reserved

---

## 📞 Contact & Support

For support or inquiries about the ChurchConnect platform, please visit [QuaeNet](https://quaenet.com/).

---

## 🏆 Key Achievements

✅ **Multi-tenant Architecture** - Supporting multiple churches on one platform  
✅ **Cross-platform Mobile App** - iOS & Android with single codebase  
✅ **Comprehensive Admin Portal** - Full-featured management dashboard  
✅ **Secure Payment Processing** - Integrated Square payment gateway  
✅ **Real-time Notifications** - Firebase Cloud Messaging integration  
✅ **Cloud Storage** - AWS S3 for scalable file management  
✅ **Progressive Web App** - Offline-capable admin portal  
✅ **RESTful API** - Well-documented, scalable backend  

---

*Last Updated: October 2025*

