import {
  logOutUser as logOutUserService,
  loginUser as loginUserService,
  refreshAccessToken as refreshAccessTokenService,
  registerUser as registerUserService,
  updateUser as updateUserService,
  uploadImage as uploadImageService,
} from '../../service/userService.js';
import env from '../../config/env.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import MESSAGES from '../../constants/messages.js';

const registerUser = async (req, res) => {

     try {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: 'Name, email, and password are required',
    });
  }

  if (name.trim().length < 2) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: 'Name must be at least 2 characters long',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: 'Please provide a valid email address',
    });
  }

  if (password.length < 6) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  const result = await registerUserService(name, email, password);

  if (result.outcome === 'user_exists') {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: 'User already exists',
    });
  }

  res.cookie('jwt', result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(STATUS_CODES.CREATED).json({
    message: 'User registered successfully',
    accessToken: result.accessToken,
    user: {
      id: result.user._id,
      name: result.user.name,
      email: result.user.email,
    },
  });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "User already exists",
      });
    }
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: "internal server error",
      error: error.message
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Please provide a valid email address' });
    }

    const result = await loginUserService(email, password);
    if (result.outcome === 'invalid_credentials') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Invalid email or password' });
    }

    res.cookie('jwt', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'None' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(STATUS_CODES.OK).json({
      message: 'Login successful',
      accessToken: result.accessToken,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        profileImage: result.user.profileImage || null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Internal server error', error: error.message });
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;

    if (!refreshToken) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Refresh token cookie missing' });
    }

    const result = await refreshAccessTokenService(refreshToken);

    if (result.outcome === 'user_not_found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    if (result.outcome === 'token_mismatch') {
      return res.status(STATUS_CODES.FORBIDDEN).json({ message: 'Token mismatch' });
    }

    return res.status(STATUS_CODES.OK).json({
      accessToken: result.accessToken,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        profileImage: result.user.profileImage || null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.FORBIDDEN).json({ message: 'Invalid or expired refresh token' });
  }
};

const logOutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;

    if (!refreshToken) {
      return res.sendStatus(STATUS_CODES.NO_CONTENT);
    }

    await logOutUserService(refreshToken);

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'None' : 'lax',
    });

    return res.status(STATUS_CODES.OK).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Logout unsuccessful' });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'No image file provided' });
    }

    const email = req.body.email;
    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.EMAIL_REQUIRED });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const result = await uploadImageService(email, imageUrl);

    if (!result) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    return res.status(STATUS_CODES.OK).json({
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
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server error while saving image' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, id } = req.body;
    const userId = req.user?.id || id;
    console.log("Update user request:", { name, email, id: userId });

    if (!name || !email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Name and email are required" });
    }

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "User ID is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid email format" });
    }

    const result = await updateUserService(userId, name, email);
    if (result.outcome === 'user_not_found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "User not found" });
    }
    
    if (result.outcome === 'email_in_use') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Email is already in use" });
    }

    const updated = result.user;

    console.log("User updated successfully:", updated._id);

    res.status(STATUS_CODES.OK).json({
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
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message 
    });
  }
};

export { registerUser, loginUser, refreshAccessToken, logOutUser, uploadImage,  updateUser };
