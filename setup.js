#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Club Event Booking System...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envContent = `MONGODB_URI=mongodb://localhost:27017/clubevent
JWT_SECRET=your_jwt_secret_key_here_${Date.now()}
PORT=3000`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
} else {
    console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    console.log('   Run: npm install');
} else {
    console.log('✅ Dependencies already installed');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Run: npm install (if not done already)');
console.log('3. Run: npm start or node server.js');
console.log('4. Visit: http://localhost:3000');
console.log('\n📖 For detailed instructions, see README.md');

// Check MongoDB connection (optional)
console.log('\n🔍 Checking MongoDB connection...');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/clubevent', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('🎯 You can now start the application with: npm start');
    process.exit(0);
})
.catch((err) => {
    console.log('❌ MongoDB connection failed:');
    console.log('   Make sure MongoDB is running on your system');
    console.log('   Or update MONGODB_URI in .env file for MongoDB Atlas');
    console.log('\n💡 To start MongoDB locally:');
    console.log('   - Windows: net start MongoDB');
    console.log('   - macOS/Linux: sudo systemctl start mongod');
    console.log('   - Or use MongoDB Atlas (cloud)');
    process.exit(1);
});
