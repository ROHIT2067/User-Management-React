import mongoose from 'mongoose';
import User from './models/userModel.js';
import bcrypt from 'bcrypt';
import env from './config/env.js';

const seed = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "admin@gamil.com";
    const existing = await User.findOne({ email });
    if (existing) {
      existing.isAdmin = true;
      await existing.save();
      console.log("Admin user already exists and updated to isAdmin: true");
    } else {
      const hashedPassword = await bcrypt.hash("admin18", 10);
      const newAdmin = new User({
        name: "Admin User",
        email,
        password: hashedPassword,
        isAdmin: true,
        isVerified: true
      });
      await newAdmin.save();
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.connection.close();
  }
};

seed();
