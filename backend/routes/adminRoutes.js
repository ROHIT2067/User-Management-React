import express from 'express';
import {
  loginAdmin,
  getAllUsers,
  updateUser,
  addUser,
  deleteUser,
  searchUser,
} from '../controller/admin/auth.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/allusers', verifyToken, verifyAdmin, getAllUsers);
router.get('/search', verifyToken, verifyAdmin, searchUser);
router.post('/add', verifyToken, verifyAdmin, addUser);
router.patch('/update/:id', verifyToken, verifyAdmin, updateUser);
router.delete('/delete/:id', verifyToken, verifyAdmin, deleteUser);

export default router;
