const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Club = require('./models/Club');
const Event = require('./models/Event');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clubevent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Clear existing data
    await User.deleteMany({});
    await Faculty.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
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
      email: 'michael.chen@university.edu',
      password: 'faculty123',
      facultyId: 'FAC002',
      department: 'Engineering',
      position: 'Associate Professor',
      phone: '+1-555-0102',
      clubName: 'Engineering Club',
      role: 'faculty'
    });

    const faculty3 = new Faculty({
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@university.edu',
      password: 'faculty123',
      facultyId: 'FAC003',
      department: 'Arts',
      position: 'Assistant Professor',
      phone: '+1-555-0103',
      clubName: 'Arts Club',
      role: 'faculty'
    });

    await faculty1.save();
    await faculty2.save();
    await faculty3.save();
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

    const artsClub = new Club({
      name: 'Arts Club',
      description: 'A club for creative students interested in arts and culture',
      facultyCoordinator: faculty3._id,
      createdBy: faculty3._id
    });

    await techClub.save();
    await engineeringClub.save();
    await artsClub.save();
    console.log('Created sample clubs');

    // Create sample students
    const students = [
      {
        name: 'John Doe',
        email: 'john.doe@student.edu',
        password: 'student123',
        studentId: 'STU001',
        department: 'Computer Science',
        year: '2024',
        phone: '+1-555-1001',
        role: 'student'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@student.edu',
        password: 'student123',
        studentId: 'STU002',
        department: 'Computer Science',
        year: '2023',
        phone: '+1-555-1002',
        role: 'student'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@student.edu',
        password: 'student123',
        studentId: 'STU003',
        department: 'Engineering',
        year: '2024',
        phone: '+1-555-1003',
        role: 'student'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@student.edu',
        password: 'student123',
        studentId: 'STU004',
        department: 'Arts',
        year: '2023',
        phone: '+1-555-1004',
        role: 'student'
      },
      {
        name: 'Alex Brown',
        email: 'alex.brown@student.edu',
        password: 'student123',
        studentId: 'STU005',
        department: 'Computer Science',
        year: '2024',
        phone: '+1-555-1005',
        role: 'student'
      }
    ];

    const createdStudents = [];
    for (const studentData of students) {
      const student = new User(studentData);
      await student.save();
      createdStudents.push(student);
    }
    console.log('Created sample students');

    // Promote some students to club admins
    const johnDoe = createdStudents[0];
    johnDoe.isClubAdmin = true;
    johnDoe.clubName = 'Tech Club';
    johnDoe.adminClub = techClub._id;
    johnDoe.position = 'Club Admin';
    await johnDoe.save();

    const mikeJohnson = createdStudents[2];
    mikeJohnson.isClubAdmin = true;
    mikeJohnson.clubName = 'Engineering Club';
    mikeJohnson.adminClub = engineeringClub._id;
    mikeJohnson.position = 'Club Admin';
    await mikeJohnson.save();

    // Update clubs with admin references
    techClub.admins.push(johnDoe._id);
    engineeringClub.admins.push(mikeJohnson._id);
    await techClub.save();
    await engineeringClub.save();

    console.log('Promoted students to club admins');

    // Create sample events
    const events = [
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development technologies including React, Node.js, and MongoDB',
        date: new Date('2024-02-15'),
        time: '10:00 AM',
        venue: 'Computer Lab 1',
        maxParticipants: 30,
        points: 15,
        createdBy: johnDoe._id,
        club: techClub._id,
        clubName: 'Tech Club'
      },
      {
        title: 'Robotics Competition',
        description: 'Annual robotics competition for engineering students',
        date: new Date('2024-02-20'),
        time: '2:00 PM',
        venue: 'Engineering Lab',
        maxParticipants: 20,
        points: 25,
        createdBy: mikeJohnson._id,
        club: engineeringClub._id,
        clubName: 'Engineering Club'
      },
      {
        title: 'Art Exhibition',
        description: 'Showcase of student artwork and creative projects',
        date: new Date('2024-02-25'),
        time: '6:00 PM',
        venue: 'Art Gallery',
        maxParticipants: 50,
        points: 10,
        createdBy: faculty3._id,
        club: artsClub._id,
        clubName: 'Arts Club'
      }
    ];

    for (const eventData of events) {
      const event = new Event(eventData);
      await event.save();
    }
    console.log('Created sample events');

    // Register some students for events
    const webDevEvent = await Event.findOne({ title: 'Web Development Workshop' });
    const roboticsEvent = await Event.findOne({ title: 'Robotics Competition' });

    // Register students for web development workshop
    webDevEvent.participants.push({
      userId: createdStudents[1]._id, // Jane Smith
      registrationDate: new Date(),
      status: 'registered'
    });
    webDevEvent.participants.push({
      userId: createdStudents[4]._id, // Alex Brown
      registrationDate: new Date(),
      status: 'registered'
    });
    webDevEvent.currentParticipants = 2;
    await webDevEvent.save();

    // Register students for robotics competition
    roboticsEvent.participants.push({
      userId: createdStudents[1]._id, // Jane Smith
      registrationDate: new Date(),
      status: 'registered'
    });
    roboticsEvent.currentParticipants = 1;
    await roboticsEvent.save();

    console.log('Registered students for events');

    console.log('\n=== Database Setup Complete ===');
    console.log('Sample data created:');
    console.log('- 3 Faculty members');
    console.log('- 3 Clubs');
    console.log('- 5 Students (2 promoted to club admins)');
    console.log('- 3 Events');
    console.log('\nLogin credentials:');
    console.log('Faculty: sarah.johnson@university.edu / faculty123');
    console.log('Students: john.doe@student.edu / student123');
    console.log('Club Admins: john.doe@student.edu / student123 (can login as both student and admin)');

  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupDatabase();


