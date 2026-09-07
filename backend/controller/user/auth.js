import User from '../../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || process.env.SECRET || 'mysecret';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || secret;



function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, refreshSecret, { expiresIn: '7d' });
}

function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, secret, { expiresIn: '15m' });
}

const registerUser = async (req, res) => {

     try {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required',
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      message: 'Name must be at least 2 characters long',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  const exists = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (exists) {
    return res.status(400).json({
      message: 'User already exists',
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const saveUser = new User({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
  });

  await saveUser.save();

  const accessToken = generateAccessToken(saveUser._id);
  const refreshToken = generateRefreshToken(saveUser._id);

  saveUser.refreshToken = refreshToken;
  await saveUser.save();

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    message: 'User registered successfully',
    accessToken,
    user: {
      id: saveUser._id,
      name: saveUser.name,
      email: saveUser.email,
    },
  });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    return res.status(400).json({
      message: "internal server error",
      error: error.message
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(existingUser._id);
    const refreshToken = generateRefreshToken(existingUser._id);

    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token cookie missing' });
    }

    const decoded = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Token mismatch' });
    }

    const newAccessToken = generateAccessToken(user._id);

    return res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const logOutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    });

    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Logout unsuccessful' });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const result = await User.findOneAndUpdate(
      { email },
      { profileImage: imageUrl },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile image uploaded successfully',
      imageUrl,
      user: {
        id: result._id,
        name: result.name,
        email: result.email,
        profileImage: result.profileImage,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error while saving image' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, id } = req.body;
    const userId = req.user?.id || id;
    console.log("Update user request:", { name, email, id: userId });

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingUser = await User.findOne({ 
      email: email.trim().toLowerCase(),
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
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

    console.log("User updated successfully:", updated._id);

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: {
        id: updated._id,
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        profileImage: updated.profileImage
      }
    });
  } catch (error) {
    console.error("Update user error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export { registerUser, loginUser, refreshAccessToken, logOutUser, uploadImage,  updateUser };
