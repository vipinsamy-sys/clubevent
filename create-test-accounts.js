const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');
const Faculty = require('./models/Faculty');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clubevent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function createTestAccounts() {
  try {
    console.log('Creating test accounts...');

    // Clear existing test accounts
    await Admin.deleteMany({ email: 'testadmin@example.com' });
    await Faculty.deleteMany({ email: 'testfaculty@example.com' });
    await User.deleteMany({ email: 'vipinsamy@gmail.com' });

    // Create test faculty
    const testFaculty = new Faculty({
      name: 'Dr. Test Faculty',
      email: 'testfaculty@example.com',
      password: 'faculty123',
      facultyId: 'TEST001',
      department: 'Computer Science',
      position: 'Professor',
      phone: '+1-555-9999',
      clubName: 'Test Club',
      role: 'faculty',
      isActive: true
    });

    await testFaculty.save();
    console.log('✅ Test Faculty created successfully!');

    // Create test admin
    const testAdmin = new Admin({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'admin123',
      clubName: 'Test Club',
      position: 'Club Admin',
      isActive: true,
      createdBy: testFaculty._id
    });

    await testAdmin.save();
    console.log('✅ Test Admin created successfully!');

    // Create test student
    const testStudent = new User({
      name: 'Vipin',
      email: 'vipinsamy@gmail.com',
      password: '123456',
      studentId: 'viping.25mts@kongu.edu',
      department: 'Mechatronics',
      year: '1st Year',
      phone: '8072942720',
      points: 100,
      role: 'student'
    });

    await testStudent.save();
    console.log('✅ Test Student created successfully!');

    console.log('\n🎉 Test accounts created successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍🏫 FACULTY LOGIN:');
    console.log('   Email: testfaculty@example.com');
    console.log('   Password: faculty123');
    console.log('   URL: http://localhost:3000/faculty-login');
    console.log('');
    console.log('🧑‍💼 ADMIN LOGIN:');
    console.log('   Email: testadmin@example.com');
    console.log('   Password: admin123');
    console.log('   URL: http://localhost:3000/admin-login');
    console.log('');
    console.log('📝 ADMIN SIGNUP:');
    console.log('   URL: http://localhost:3000/admin-signup');
    console.log('');
    console.log('👨‍🎓 STUDENT LOGIN:');
    console.log('   Email: vipinsamy@gmail.com');
    console.log('   Password: 123456');
    console.log('   URL: http://localhost:3000/student-login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestAccounts();
