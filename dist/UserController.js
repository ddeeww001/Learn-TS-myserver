"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./User"));
const Utils_1 = require("./Utils");
// ตรวจสอบว่า id เป็น ObjectId ที่ถูกต้องหรือไม่
const isValidId = (id) => typeof id === 'string' && mongoose_1.default.Types.ObjectId.isValid(id);
// 1. Create User
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, password } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'กรุณากรอก name, email และ password ให้ครบ' });
        }
        if (!Utils_1.utils.isValidEmail(email)) {
            return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
        }
        if (!Utils_1.utils.isValidPassword(password)) {
            return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
        }
        const existing = yield User_1.default.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }
        const newUser = new User_1.default({ name, email, password });
        yield newUser.save();
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});
exports.createUser = createUser;
// 2. Get All Users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});
exports.getUsers = getUsers;
// 3. Get User By ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});
exports.getUserById = getUserById;
// 4. Delete User
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const user = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});
exports.deleteUser = deleteUser;
// 5. Update User
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updateData = req.body;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(id, updateData, {
            returnDocument: 'after',
            runValidators: true, // checking schema
        });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating user', error });
    }
});
exports.updateUser = updateUser;
