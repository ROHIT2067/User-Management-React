import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import env from '../config/env.js';

const secret = env.JWT_SECRET;
const refreshSecret = env.REFRESH_TOKEN_SECRET;

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, refreshSecret, { expiresIn: '7d' });
}

function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, secret, { expiresIn: '15m' });
}

const registerUser = async (name, email, password) => {
  const exists = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (exists) {
    return { outcome: 'user_exists' };
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = new User({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
  });

  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return { outcome: 'success', accessToken, refreshToken, user };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return { outcome: 'invalid_credentials' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return { outcome: 'invalid_credentials' };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return { outcome: 'success', accessToken, refreshToken, user };
};

const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, refreshSecret);
  const user = await User.findById(decoded.id);

  if (!user) {
    return { outcome: 'user_not_found' };
  }

  if (user.refreshToken !== refreshToken) {
    return { outcome: 'token_mismatch' };
  }

  const accessToken = generateAccessToken(user._id);
  return { outcome: 'success', accessToken, user };
};

const logOutUser = async (refreshToken) => {
  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};

const uploadImage = async (email, imageUrl) => {
  return await User.findOneAndUpdate(
    { email },
    { profileImage: imageUrl },
    { new: true }
  );
};

const updateUser = async (userId, name, email) => {
  const user = await User.findById(userId);
  if (!user) {
    return { outcome: 'user_not_found' };
  }

  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
    _id: { $ne: userId }
  });

  if (existingUser) {
    return { outcome: 'email_in_use' };
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    },
    { new: true }
  );

  return { outcome: 'success', user: updated };
};

export {
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateUser,
  uploadImage,
};
