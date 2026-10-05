
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from './User';
import { utils } from './Utils';

// ตรวจสอบว่า id เป็น ObjectId ที่ถูกต้องหรือไม่
const isValidId = (id: unknown): id is string =>
  typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

// 1. Create User
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอก name, email และ password ให้ครบ' });
    }
    if (!utils.isValidEmail(email)) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }
    if (!utils.isValidPassword(password)) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// 2. Get All Users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

// 3. Get User By ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};

// 4. Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// 5. Update User
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true, // checking schema
    });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user', error });
  }
};

