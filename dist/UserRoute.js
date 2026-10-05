"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("./UserController");
const router = express_1.default.Router();
// Create a new user (สร้างข้อมูลผู้ใช้ใหม่)
router.post('/users', UserController_1.createUser);
// Get all users (ดึงข้อมูลผู้ใช้ทั้งหมด)
router.get('/users', UserController_1.getUsers);
// Get user by ID (ดึงข้อมูลผู้ใช้รายบุคคลตาม ID)
router.get('/users/:id', UserController_1.getUserById);
// Update user by ID (แก้ไขข้อมูลผู้ใช้ตาม ID)
router.put('/users/:id', UserController_1.updateUser);
// Delete user by ID (ลบข้อมูลผู้ใช้ตาม ID)
router.delete('/users/:id', UserController_1.deleteUser);
exports.default = router;
