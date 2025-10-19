/*
  Maintenance script to normalize faculty emails and hash any plaintext passwords.
  Usage: node scripts/maintain-faculty.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Faculty = require('../models/Faculty');

async function normalizeFacultyRecords() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clubevent';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    const faculties = await Faculty.find({});

    let updatedCount = 0;
    for (const faculty of faculties) {
      let needsSave = false;

      // Normalize email
      const normalizedEmail = (faculty.email || '').toLowerCase().trim();
      if (faculty.email !== normalizedEmail) {
        faculty.email = normalizedEmail;
        needsSave = true;
      }

      // Fix missing required fields
      if (!faculty.clubName) {
        faculty.clubName = 'General Club';
        needsSave = true;
      }

      if (!faculty.position) {
        faculty.position = 'Club Coordinator';
        needsSave = true;
      }

      // Fix invalid role
      if (faculty.role && faculty.role !== 'faculty') {
        faculty.role = 'faculty';
        needsSave = true;
      }

      // Hash plaintext passwords
      const password = faculty.password;
      const looksHashed = typeof password === 'string' && password.startsWith('$2');
      if (!looksHashed && typeof password === 'string' && password.length > 0) {
        faculty.password = await bcrypt.hash(password, 12);
        needsSave = true;
      }

      if (needsSave) {
        await faculty.save();
        updatedCount += 1;
      }
    }

    console.log(`Faculty maintenance complete. Updated ${updatedCount} record(s).`);
  } catch (err) {
    console.error('Maintenance failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

normalizeFacultyRecords();



