import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import env from '../config/env.js';

const secret = env.JWT_SECRET;

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, secret, { expiresIn: '15m' });
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const loginAdmin = async (email, password) => {
  const admin = await User.findOne({ email });
  console.log("admin data received from mongo", admin);

  if (!admin) {
    return { outcome: 'user_not_found' };
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    return { outcome: 'invalid_password' };
  }

  if (!admin.isAdmin) {
    return { outcome: 'access_denied' };
  }

  const accessToken = generateAccessToken(admin._id);
  console.log("access token in login controller :", accessToken);

  return {
    outcome: 'success',
    user: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      profileImage: admin?.profileImage || null,
      isAdmin: admin.isAdmin,
    },
    accessToken,
  };
};

const getAllUsers = async () => {
  return await User.find({ isDeleted: { $ne: true } })
    .select('-password -refreshToken')
    .sort({ createdAt: -1 });
};

const searchUser = async (searchTerm) => {
  return await User.find({
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ],
  });
};

const updateUser = async (userId, name, email) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  return await User.updateOne(
    { _id: userId },
    {
      $set: {
        name,
        email,
      },
    }
  );
};

const addUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    return { existingUser: true };
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
  return { existingUser: false, createdUser };
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export {
  addUser,
  deleteUser,
  getAllUsers,
  loginAdmin,
  searchUser,
  updateUser,
};
