import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logOutUser, uploadImage, updateUser } from '../controller/user/auth.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import STATUS_CODES from '../constants/statusCodes.js';
import MESSAGES from '../constants/messages.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: err.message || MESSAGES.INVALID_IMAGE_TYPE
      });
    }
    next();
  });
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logOutUser);
router.post('/upload-image', verifyToken, handleUpload, uploadImage);
router.put('/update', verifyToken, updateUser);
router.patch('/update-profile', verifyToken, updateUser);

export default router;
