# 🩸 DROPLIFE - Smart Blood Donation System

A comprehensive MERN stack application connecting blood donors, recipients, hospitals, and healthcare facilities in real-time with 62 API routes, interactive maps, analytics dashboards, voice assistant, and multi-language support.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### 🏠 Four Distinct Panels
| Panel | Description | Routes |
|-------|-------------|--------|
| **Donor** | Blood donor profile, history, donation tracking | `/donor/dashboard` |
| **User** | Regular users - request blood, track status | `/user/dashboard` |
| **Hospital** | Full hospital management - blood bank, deliveries, patients | `/hospital/*` |
| **Admin** | System administration, analytics, user management | `/admin/*` |

### For Donors
- ✅ Easy registration with blood group and location
- ✅ Real-time notifications for nearby blood requests
- ✅ Track donation history and eligibility
- ✅ Register for donation camps
- ✅ Update availability status
- ✅ View active blood requests

### For Recipients
- ✅ Create urgent blood requests
- ✅ Automated donor matching based on blood group and location
- ✅ Track request status in real-time
- ✅ Direct contact with matched donors
- ✅ Email notifications

### For Admins
- ✅ Comprehensive dashboard with statistics
- ✅ Manage donor database
- ✅ Blood stock management (add/withdraw units)
- ✅ Create and manage donation camps
- ✅ Verify donors
- ✅ Monitor blood requests
- ✅ Generate reports

### For Hospitals
- ✅ Hospital registration and management dashboard
- ✅ Blood bank stock management with visual alerts
- ✅ Blood delivery request and tracking system
- ✅ Patient blood records management
- ✅ Staff management
- ✅ Request blood from central blood bank
- ✅ Blood availability published publicly

### For Regular Users
- ✅ Register without being a donor
- ✅ Request blood quickly
- ✅ Track blood request status
- ✅ Find nearby hospitals and donors on map

### Technical Features
- ✅ JWT-based authentication & authorization
- ✅ Real-time geolocation-based donor matching
- ✅ Email notification system (Nodemailer)
- ✅ **62 RESTful API endpoints** (exceeds 40+ requirement)
- ✅ Redux state management
- ✅ Responsive design with Bootstrap
- ✅ Form validation with Formik & Yup
- ✅ Role-based access control (Donor / User / Hospital / Admin)
- ✅ Secure password hashing (bcrypt)
- ✅ MongoDB with geospatial queries
- ✅ **Interactive map** (React Leaflet + OpenStreetMap)
- ✅ **Analytics dashboards** (Recharts)
- ✅ **Voice assistant** (Web Speech API)
- ✅ **Multi-language support** (38 languages via i18next)
- ✅ **In-app notifications** with real-time bell indicator
- ✅ **Blood delivery tracking** system
- ✅ Rate limiting for API security (express-rate-limit)

## 🛠️ Tech Stack

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Bootstrap 5 + React Bootstrap
- Axios, Formik & Yup
- React Toastify, React Icons
- **React Leaflet 4** (Maps)
- **Recharts** (Analytics)
- **react-i18next** (40+ languages)
- Web Speech API (Voice)

### Backend
- Node.js 18, Express.js
- MongoDB with Mongoose
- JWT, bcryptjs
- Nodemailer, express-rate-limit
- CORS, dotenv

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure
```
DropLife/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js          # Auth (register, login, password reset)
│   │   ├── donorController.js         # Donor profile & history
│   │   ├── bloodRequestController.js  # Blood request management
│   │   ├── campController.js          # Donation camp management
│   │   ├── adminController.js         # Admin operations
│   │   ├── hospitalController.js      # Hospital management (NEW)
│   │   ├── notificationController.js  # Notifications (NEW)
│   │   ├── deliveryController.js      # Blood delivery tracking (NEW)
│   │   └── analyticsController.js     # Analytics & charts (NEW)
│   ├── middleware/
│   │   ├── auth.js                    # JWT + role authorization
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js                    # Users (donor/user/hospital/admin roles)
│   │   ├── BloodRequest.js
│   │   ├── DonationCamp.js
│   │   ├── BloodStock.js
│   │   ├── Hospital.js                # Hospital data (NEW)
│   │   ├── Notification.js            # In-app notifications (NEW)
│   │   └── BloodDelivery.js           # Blood delivery records (NEW)
│   ├── routes/
│   │   ├── auth.js         # 8 routes
│   │   ├── donor.js        # 5 routes
│   │   ├── bloodRequest.js # 7 routes
│   │   ├── camp.js         # 6 routes
│   │   ├── admin.js        # 6 routes
│   │   ├── hospital.js     # 13 routes (NEW)
│   │   ├── notification.js # 5 routes (NEW)
│   │   ├── delivery.js     # 7 routes (NEW)
│   │   └── analytics.js    # 5 routes (NEW)
│   │   # TOTAL: 62 routes
│   ├── utils/
│   │   ├── sendEmail.js
│   │   └── sendNotification.js
│   ├── .env.example                   # Environment template (NEW)
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── locales/                   # i18n translations (NEW)
│   │       ├── en/translation.json
│   │       └── hi/translation.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Updated: language selector, notification bell
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx     # Updated: hospitalOnly prop
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── SplitTextAnimation.jsx
│   │   │   ├── LanguageSelector.jsx   # 38 languages (NEW)
│   │   │   ├── NotificationBell.jsx   # Real-time bell (NEW)
│   │   │   └── VoiceAssistant.jsx     # Voice navigation (NEW)
│   │   ├── pages/
│   │   │   ├── Welcome.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx     # NEW
│   │   │   ├── ResetPassword.jsx      # NEW
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── UserDashboard.jsx      # NEW - User panel
│   │   │   ├── HospitalLogin.jsx      # NEW
│   │   │   ├── HospitalSignup.jsx     # NEW
│   │   │   ├── HospitalDashboard.jsx  # NEW - Hospital panel
│   │   │   ├── HospitalBloodBank.jsx  # NEW - Blood stock management
│   │   │   ├── HospitalDeliveries.jsx # NEW - Delivery records
│   │   │   ├── HospitalRequests.jsx   # NEW - Blood requests
│   │   │   ├── HospitalPatients.jsx   # NEW - Patient records
│   │   │   ├── HospitalStaff.jsx      # NEW - Staff management
│   │   │   ├── HospitalsPublic.jsx    # NEW - Public hospital listing
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DeliveryRecords.jsx    # NEW - Admin delivery management
│   │   │   ├── BloodRequest.jsx
│   │   │   ├── BloodAvailability.jsx
│   │   │   ├── DonationCamps.jsx
│   │   │   ├── DonorList.jsx
│   │   │   ├── BloodStockManagement.jsx
│   │   │   ├── MapView.jsx            # NEW - Leaflet map
│   │   │   ├── Analytics.jsx          # NEW - Recharts dashboards
│   │   │   ├── NotificationsPage.jsx  # NEW - Notification center
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Privacy.jsx
│   │   │   └── Helpline.jsx
│   │   ├── i18n/
│   │   │   └── index.js               # i18next setup (NEW)
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   └── donorSlice.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx                    # Updated: all new routes
│   │   ├── App.css
│   │   ├── index.js                   # Updated: i18n import
│   │   └── index.css
│   ├── .env.example                   # Environment template (NEW)
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Gmail account (for email notifications)

### Clone Repository
```bash
git clone https://github.com/yourusername/droplife.git
cd droplife
```

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:3000

ADMIN_EMAIL=admin@droplife.com
ADMIN_PASSWORD=Admin@123
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/droplife |
| JWT_SECRET | Secret key for JWT | your_secret_key_here |
| JWT_EXPIRE | JWT expiration time | 7d |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email address | your_email@gmail.com |
| EMAIL_PASS | Email app password | your_16_char_password |
| FRONTEND_URL | Frontend URL | http://localhost:3000 |
| ADMIN_EMAIL | Admin email | admin@droplife.com |
| ADMIN_PASSWORD | Admin password | Admin@123 |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

## 💻 Running Locally

### Start Backend Server
```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

### Default Admin Credentials
```
Email: admin@droplife.com
Password: Admin@123
```

## 🌐 Deployment

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Configure database user and network access (allow 0.0.0.0/0)
4. Get connection string

### Backend Deployment (Render)

1. Push code to GitHub
2. Create account at [Render](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add all environment variables
7. Deploy

### Frontend Deployment (Vercel)

1. Create account at [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variable: `REACT_APP_API_URL`
5. Deploy

### Gmail App Password Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → 2-Step Verification
3. Generate App Password
4. Use this password in `EMAIL_PASS` environment variable

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register        - Register new donor
POST   /api/auth/login           - User login
POST   /api/auth/admin/login     - Admin login
GET    /api/auth/me              - Get current user
```

### Donor Endpoints
```
GET    /api/donor/profile        - Get donor profile
PUT    /api/donor/profile        - Update donor profile
PUT    /api/donor/availability   - Update availability status
GET    /api/donor/history        - Get donation history
GET    /api/donor/nearby         - Get nearby donors (Admin)
```

### Blood Request Endpoints
```
POST   /api/blood-request        - Create blood request
GET    /api/blood-request        - Get all requests
GET    /api/blood-request/:id    - Get single request
PUT    /api/blood-request/:id/status - Update request status
PUT    /api/blood-request/:id/respond - Respond to request
```

### Camp Endpoints
```
POST   /api/camps                - Create camp (Admin)
GET    /api/camps                - Get all camps
GET    /api/camps/:id            - Get single camp
POST   /api/camps/:id/register   - Register for camp
PUT    /api/camps/:id            - Update camp (Admin)
DELETE /api/camps/:id            - Delete camp (Admin)
```

### Admin Endpoints
```
GET    /api/admin/donors         - Get all donors
GET    /api/admin/stats          - Get dashboard statistics
GET    /api/admin/blood-stock    - Get blood stock
PUT    /api/admin/blood-stock/:bloodGroup - Update stock
PUT    /api/admin/donors/:id/verify - Verify donor
DELETE /api/admin/donors/:id     - Delete donor
```

## 📸 Screenshots

### Welcome Page
![Welcome](https://via.placeholder.com/800x400/667eea/ffffff?text=Welcome+Page+with+Animation)

### Home Page
![Home](https://via.placeholder.com/800x400/dc3545/ffffff?text=Home+Page)

### Donor Dashboard
![Dashboard](https://via.placeholder.com/800x400/28a745/ffffff?text=Donor+Dashboard)

### Admin Dashboard
![Admin](https://via.placeholder.com/800x400/ffc107/ffffff?text=Admin+Dashboard)

## 🎯 Key Learnings & Resume Points

### Full-Stack Development
- Built complete MERN stack application from scratch
- Implemented 15+ pages with complex routing
- Created RESTful API with 20+ endpoints
- Integrated third-party services (MongoDB Atlas, Email)

### Authentication & Security
- JWT-based authentication system
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected routes and API endpoints

### Real-Time Features
- Geolocation-based donor matching
- GPS coordinates using browser Geolocation API
- MongoDB geospatial queries ($near operator)
- Real-time notifications via email

### State Management
- Redux Toolkit for global state
- Async thunks for API calls
- LocalStorage persistence

### Form Handling
- Formik for form management
- Yup schema validation
- Dynamic form fields
- File upload capability

### Responsive Design
- Mobile-first approach
- Bootstrap 5 components
- Custom CSS animations
- Accessibility considerations

### Deployment & DevOps
- Frontend on Vercel
- Backend on Render
- Database on MongoDB Atlas
- Environment variable management
- CI/CD pipeline

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 👨‍💻 Author

Sonali Jena - [GitHub](https://github.com/sonalidevloper)

## 🙏 Acknowledgments

- Blood donation organizations for inspiration
- Open-source community
- MongoDB, React, and Node.js teams

## 📞 Support

For support, email support@droplife.com or join our Slack channel.

---

**Made with ❤️ and ☕ for saving lives**

⭐ Star this repo if you found it helpful!
