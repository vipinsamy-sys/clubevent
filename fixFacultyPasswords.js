const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Faculty = mongoose.model(
  "Faculty",
  new mongoose.Schema({}, { strict: false }),
  "faculties"
);

async function fixPasswords() {
  try {
    // 🧠 Replace with your actual MongoDB connection string:
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clubevent', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    const faculties = await Faculty.find();
    console.log(`Found ${faculties.length} faculty records`);

    for (const f of faculties) {
      if (!f.password.startsWith("$2")) {
        const oldPass = f.password;
        f.password = await bcrypt.hash(f.password, 12);
        await f.save();
        console.log(`🔐 Rehashed: ${f.name} (old: ${oldPass})`);
      }
    }

    console.log("✅ Password rehashing completed!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.connection.close();
  }
}

fixPasswords();
