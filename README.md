# Club Event Booking System

A comprehensive full-stack web application for managing club events with role-based access control for Students, Admins, and Faculty.

## Features

### 🎯 User Roles & Capabilities

#### **Students (Users)**
- ✅ Book club events (register for events)
- ✅ View booking history
- ✅ Download/view certificates
- ✅ View students leaderboard
- ✅ Track personal progress and points

#### **Admins**
- ✅ Create club events with title, description, date, time, and venue
- ✅ View participants for each event
- ✅ Upload certificates for participants
- ✅ Control and update students' activity during events (status: ongoing, completed, etc.)
- ✅ Manage admin accounts (add/remove admins)

#### **Faculty**
- ✅ View all events and participating students
- ✅ Access past events participants and winners
- ✅ Access student progress and participation records
- ✅ View students leaderboard
- ✅ Manage admin accounts (add/remove admins)

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Bootstrap 5, Font Awesome icons

## 📁 Project Structure

```
clubevent/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── models/                  # Database models
│   ├── User.js             # User model (Students, Admins, Faculty)
│   ├── Event.js            # Event model
│   └── Leaderboard.js      # Leaderboard model
├── routes/                  # API routes
│   ├── auth.js             # Authentication routes
│   ├── events.js           # Event management routes
│   ├── users.js            # User-specific routes
│   ├── admin.js            # Admin-specific routes
│   └── faculty.js          # Faculty-specific routes
├── middleware/              # Custom middleware
│   └── auth.js             # Authentication middleware
└── public/                  # Frontend files
    ├── index.html          # Landing page
    ├── login.html          # Login page
    ├── register.html       # Registration page
    ├── student-dashboard.html    # Student dashboard
    ├── admin-dashboard.html   # Admin dashboard
    └── faculty-dashboard.html # Faculty dashboard
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd clubevent
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/clubevent
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### Step 4: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

### Step 5: Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 📱 Usage Guide

### 1. **Getting Started**
- Visit `http://localhost:3000`
- Register as a Student, or login as Admin/Faculty
- Each role has different capabilities and dashboards

### 2. **Student Registration**
- Click "Register" on the homepage
- Fill in personal details (name, email, student ID, department, year, phone)
- Choose "Student" role
- Complete registration and login

### 3. **Admin Features**
- Create new events with all details
- View and manage event participants
- Upload certificates for participants
- Update participant status (registered → attended → completed)
- Manage other admin accounts

### 4. **Faculty Features**
- View all events and participants
- Access past events and winners
- Monitor student progress and participation
- View comprehensive leaderboard
- Manage admin accounts

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin only)
- `POST /api/events/:id/register` - Register for event (Student only)
- `PUT /api/events/:id/status` - Update event status (Admin only)

### Users
- `GET /api/users/events` - Get user's registered events
- `GET /api/users/certificates` - Get user's certificates
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Admin Routes
- `GET /api/admin/events` - Get admin's events
- `GET /api/admin/students` - Get all students
- `POST /api/admin/create-admin` - Create new admin

### Faculty Routes
- `GET /api/faculty/events` - Get all events
- `GET /api/faculty/past-events` - Get past events
- `GET /api/faculty/students-progress` - Get student progress
- `GET /api/faculty/leaderboard` - Get leaderboard

## 🎨 UI/UX Features

- **Responsive Design**: Works on all devices (desktop, tablet, mobile)
- **Modern UI**: Clean, professional interface with Bootstrap 5
- **Role-based Navigation**: Different sidebars and features for each role
- **Interactive Elements**: Hover effects, smooth transitions
- **Color-coded Status**: Different colors for event status, participant status
- **Progress Tracking**: Visual progress bars and statistics

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Role-based Access Control**: Different permissions for each role
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing configuration

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  studentId: String (unique),
  department: String,
  year: String,
  phone: String,
  role: String (student/admin/faculty),
  registeredEvents: [ObjectId],
  certificates: [ObjectId],
  points: Number
}
```

### Event Model
```javascript
{
  title: String,
  description: String,
  date: Date,
  time: String,
  venue: String,
  maxParticipants: Number,
  currentParticipants: Number,
  participants: [ObjectId],
  status: String (upcoming/ongoing/completed),
  createdBy: ObjectId,
  certificates: [ObjectId],
  points: Number
}
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Update environment variables
3. Run `npm start`
4. Deploy to platforms like Heroku, Vercel, or AWS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Future Enhancements

- [ ] Email notifications for events
- [ ] File upload for certificates
- [ ] Advanced analytics and reporting
- [ ] Mobile app integration
- [ ] Real-time notifications
- [ ] Event calendar integration
- [ ] Advanced search and filtering
- [ ] Export functionality for reports

---

**Built with ❤️ for efficient club event management**
