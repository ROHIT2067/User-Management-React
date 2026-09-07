import User from '../../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || process.env.SECRET || 'mysecret';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, secret, { expiresIn: '15m' });
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const loginAdmin = async (req, res) => {
  console.log("admin login called");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await User.findOne({ email });
    console.log("admin data received from mongo", admin);

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!admin.isAdmin) {
      return res.status(403).json({ message: "Access denied: Not an admin" });
    }

    const accessToken = generateAccessToken(admin._id);
    console.log("access token in login controller :", accessToken);
    return res.status(200).json({
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        profileImage: admin?.profileImage || null,
        isAdmin: admin.isAdmin,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  console.log("getting all users controller called");

  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ 
      message: "Failed to fetch users",
      error: error.message 
    });
  }
};

const searchUser = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    });
    res.json(users);
  } catch (error) {
    console.error("Search user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;

    if (!name || !email) {
      return res.status(400).json({ message: "name or email is invalid" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await User.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          email,
        },
      }
    );

    res
      .status(200)
      .json({ message: "User updated successfully", result: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Full Name is required" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ message: "Name cannot exceed 50 characters" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });
    console.log("admin add aki");

    await newUser.save();

    console.log(newUser, "puthiya aaala");

    const createdUser = await User.findOne({ email });
    res.status(200).json({ createdUser });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  loginAdmin,
  getAllUsers,
  updateUser,
  addUser,
  deleteUser,
  searchUser,
};
