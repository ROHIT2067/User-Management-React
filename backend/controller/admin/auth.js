import {
  addUser as addUserService,
  deleteUser as deleteUserService,
  getAllUsers as getAllUsersService,
  loginAdmin as loginAdminService,
  searchUser as searchUserService,
  updateUser as updateUserService,
} from '../../service/adminService.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import MESSAGES from '../../constants/messages.js';

const loginAdmin = async (req, res) => {
  console.log("admin login called");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Email and password are required" });
    }

    const result = await loginAdminService(email, password);

    if (result.outcome === 'user_not_found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "User not found" });
    }

    if (result.outcome === 'invalid_password') {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Invalid password" });
    }

    if (result.outcome === 'access_denied') {
      return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Access denied: Not an admin" });
    }

    return res.status(STATUS_CODES.OK).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  console.log("getting all users controller called");

  try {
    const users = await getAllUsersService();
    
    console.log(`Found ${users.length} users`);
    return res.status(STATUS_CODES.OK).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: "Failed to fetch users",
      error: error.message 
    });
  }
};

const searchUser = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const users = await searchUserService(searchTerm);
    res.json(users);
  } catch (error) {
    console.error("Search user error:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;

    if (!name || !email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "name or email is invalid" });
    }

    const updated = await updateUserService(userId, name, email);
    if (!updated) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "User not found" });
    }

    res
      .status(STATUS_CODES.OK)
      .json({ message: "User updated successfully", result: updated });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Internal server error" });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.FULL_NAME_REQUIRED });
    }

    if (name.trim().length < 2) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.NAME_MIN_LENGTH });
    }

    if (name.trim().length > 50) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.NAME_MAX_LENGTH });
    }

    if (!email || !email.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.EMAIL_ADDRESS_REQUIRED });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid email format" });
    }

    if (!password || password.length < 6) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.PASSWORD_MIN_LENGTH });
    }

    const result = await addUserService(name, email, password);
    if (result.existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "User already exists" });
    }
    res.status(STATUS_CODES.OK).json({ createdUser: result.createdUser });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "User already exists" });
    }
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteUserService(id);

    return res.status(STATUS_CODES.OK).json({ message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Internal server error" });
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
