import express from 'express';
import { 
  createUser, 
  getUsers, 
  getUserById, 
  deleteUser, 
  updateUser 
} from './UserController';

const router = express.Router();

// Create a new user (สร้างข้อมูลผู้ใช้ใหม่)
router.post('/users', createUser);

// Get all users (ดึงข้อมูลผู้ใช้ทั้งหมด)
router.get('/users', getUsers);

// Get user by ID (ดึงข้อมูลผู้ใช้รายบุคคลตาม ID)
router.get('/users/:id', getUserById);

// Update user by ID (แก้ไขข้อมูลผู้ใช้ตาม ID)
router.put('/users/:id', updateUser);

// Delete user by ID (ลบข้อมูลผู้ใช้ตาม ID)
router.delete('/users/:id', deleteUser);

export default router;