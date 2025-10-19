# 🚀 Quick Installation Guide

## Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

## 🏃‍♂️ Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
node setup.js
```
*This will create a `.env` file with default settings*

### Step 3: Start the Application
```bash
npm start
```

Visit: **http://localhost:3000**

---

## 🔧 Manual Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/clubevent
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### 3. Start MongoDB
**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

### 4. Run Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🎯 First Time Usage

### 1. Register as Student
- Go to http://localhost:3000
- Click "Register"
- Fill in your details
- Choose "Student" role
- Complete registration

### 2. Create Admin Account (Optional)
- Register with "Admin" role
- Or use the admin management features

### 3. Create Faculty Account (Optional)
- Register with "Faculty" role
- Access comprehensive monitoring features

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod
```

### Port Already in Use
```bash
# Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Access Points

- **Homepage**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Student Dashboard**: http://localhost:3000/student-dashboard
- **Admin Dashboard**: http://localhost:3000/admin-dashboard
- **Faculty Dashboard**: http://localhost:3000/faculty-dashboard

---

## 🎨 Features Overview

### Student Features
- ✅ Register for events
- ✅ View booking history
- ✅ Download certificates
- ✅ View leaderboard
- ✅ Track progress

### Admin Features
- ✅ Create events
- ✅ Manage participants
- ✅ Upload certificates
- ✅ Control event status
- ✅ Manage admin accounts

### Faculty Features
- ✅ View all events
- ✅ Monitor student progress
- ✅ Access past events
- ✅ View leaderboard
- ✅ Manage admin accounts

---

## 🆘 Need Help?

1. **Check README.md** for detailed documentation
2. **Check console logs** for error messages
3. **Verify MongoDB** is running
4. **Check .env file** configuration
5. **Restart the application**

---

**🎉 You're all set! Enjoy managing your club events!**
