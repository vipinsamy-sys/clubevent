const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Admin = require('./models/Admin');
const Faculty = require('./models/Faculty');
const Event = require('./models/Event');
const Club = require('./models/Club');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clubevent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function setupSampleData() {
  try {
    console.log('Setting up sample data...');

    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Faculty.deleteMany({});
    await Event.deleteMany({});
    await Club.deleteMany({});
    console.log('Cleared existing data');

    // Create sample faculty
    const faculty1 = new Faculty({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      password: 'faculty123',
      facultyId: 'FAC001',
      department: 'Computer Science',
      position: 'Professor',
      phone: '+1-555-0101',
      clubName: 'Tech Club',
      role: 'faculty'
    });

    const faculty2 = new Faculty({
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',m
      password: 'faculty123',
      facultyId: 'FAC002',
      department: 'Engineering',
      position: 'Associate Professor',
      phone: '+1-555-0102',
      clubName: 'Engineering Club',
      role: 'faculty'
    });

    await faculty1.save();
    await faculty2.save();
    console.log('Created sample faculty');

    // Create sample clubs
    const techClub = new Club({
      name: 'Tech Club',
      description: 'A club for technology enthusiasts and computer science students',
      facultyCoordinator: faculty1._id,
      createdBy: faculty1._id
    });

    const engineeringClub = new Club({
      name: 'Engineering Club',
      description: 'A club for engineering students to collaborate on projects',
      facultyCoordinator: faculty2._id,
      createdBy: faculty2._id
    });

    await techClub.save();
    await engineeringClub.save();
    console.log('Created sample clubs');

    // Create sample students
    const students = [
      {
        name: 'John Doe',
        email: 'john.doe@student.edu',
        password: 'student123',
        studentId: 'STU001',
        department: 'Computer Science',
        year: '3rd Year',
        phone: '+1-555-1001',
        role: 'student'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@student.edu',
        password: 'student123',
        studentId: 'STU002',
        department: 'Engineering',
        year: '2nd Year',
        phone: '+1-555-1002',
        role: 'student'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@student.edu',
        password: 'student123',
        studentId: 'STU003',
        department: 'Computer Science',
        year: '4th Year',
        phone: '+1-555-1003',
        role: 'student'
      }
    ];

    for (const studentData of students) {
      const student = new User(studentData);
      await student.save();
    }
    console.log('Created sample students');

    // Create sample admin
    const admin = new Admin({
      name: 'Alice Wilson',
      email: 'alice.wilson@admin.edu',
      password: 'admin123',
      clubName: 'Tech Club',
      position: 'Club Admin',
      createdBy: faculty1._id
    });

    await admin.save();
    console.log('Created sample admin');

    // Create sample events
    const events = [
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development techniques',
        date: new Date('2024-02-15'),
        time: '10:00 AM',
        venue: 'Computer Lab 1',
        maxParticipants: 30,
        currentParticipants: 0,
        status: 'upcoming',
        createdBy: admin._id,
        club: techClub._id,
        clubName: 'Tech Club',
        points: 10
      },
      {
        title: 'Hackathon 2024',
        description: '24-hour coding competition',
        date: new Date('2024-02-20'),
        time: '9:00 AM',
        venue: 'Main Auditorium',
        maxParticipants: 50,
        currentParticipants: 0,
        status: 'upcoming',
        createdBy: admin._id,
        club: techClub._id,
        clubName: 'Tech Club',
        points: 25
      },
      {
        title: 'AI and Machine Learning Seminar',
        description: 'Introduction to AI and ML concepts',
        date: new Date('2024-01-15'),
        time: '2:00 PM',
        venue: 'Lecture Hall A',
        maxParticipants: 100,
        currentParticipants: 0,
        status: 'completed',
        createdBy: admin._id,
        club: techClub._id,
        clubName: 'Tech Club',
        points: 15
      }
    ];

    for (const eventData of events) {
      const event = new Event(eventData);
      await event.save();
    }
    console.log('Created sample events');

    console.log('Sample data setup completed successfully!');
    console.log('\nSample accounts created:');
    console.log('Faculty:');
    console.log('- sarah.johnson@university.edu / faculty123');
    console.log('- michael.chen@university.edu / faculty123');
    console.log('\nAdmin:');
    console.log('- alice.wilson@admin.edu / admin123');
    console.log('\nStudents:');
    console.log('- john.doe@student.edu / student123');
    console.log('- jane.smith@student.edu / student123');
    console.log('- bob.johnson@student.edu / student123');

  } catch (error) {
    console.error('Error setting up sample data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupSampleData();
