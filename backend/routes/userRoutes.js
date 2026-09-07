import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logOutUser, uploadImage, updateUser } from '../controller/user/auth.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err.message || 'Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed. PDF and non-image files are not permitted.' 
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
