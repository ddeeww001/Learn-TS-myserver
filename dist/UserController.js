"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = __importDefault(require("./User.js"));
const scrypt = (0, node_util_1.promisify)(node_crypto_1.scrypt);
async function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64));
    return `${salt}:${derivedKey.toString("hex")}`;
}
function publicUser(user) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
}
function isValidUserInput(input) {
    return (typeof input.name === "string" &&
        input.name.trim().length > 0 &&
        typeof input.email === "string" &&
        input.email.trim().length > 0 &&
        typeof input.password === "string" &&
        input.password.length >= 6);
}
function routeParam(value) {
    return Array.isArray(value) ? value[0] ?? "" : value;
}
function invalidId(id, res) {
    const normalizedId = routeParam(id);
    if (!mongoose_1.default.isValidObjectId(normalizedId)) {
        res.status(400).json({ message: "Invalid user id" });
        return true;
    }
    return false;
}
async function createUser(req, res) {
    const input = (req.body ?? {});
    if (!isValidUserInput(input)) {
        return res.status(400).json({
            message: "name and email are required; password must be at least 6 characters",
        });
    }
    try {
        const name = input.name;
        const email = input.email;
        const password = input.password;
        const user = await User_js_1.default.create({
            name,
            email,
            password: await hashPassword(password),
        });
        return res.status(201).json(publicUser(user.toObject()));
    }
    catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Error creating user" });
    }
}
async function getUsers(_req, res) {
    try {
        const users = await User_js_1.default.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json(users);
    }
    catch (error) {
        console.error("Error retrieving users:", error);
        return res.status(500).json({ message: "Error retrieving users" });
    }
}
async function getUserById(req, res) {
    if (invalidId(req.params.id, res))
        return;
    const id = routeParam(req.params.id);
    try {
        const user = await User_js_1.default.findById(id).select("-password").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({ message: "Error retrieving user" });
    }
}
async function updateUser(req, res) {
    if (invalidId(req.params.id, res))
        return;
    const id = routeParam(req.params.id);
    const input = (req.body ?? {});
    const updateData = {};
    if (input.name !== undefined) {
        if (typeof input.name !== "string" || input.name.trim().length === 0) {
            return res.status(400).json({ message: "name must not be empty" });
        }
        updateData.name = input.name.trim();
    }
    if (input.email !== undefined) {
        if (typeof input.email !== "string" || input.email.trim().length === 0) {
            return res.status(400).json({ message: "email must not be empty" });
        }
        updateData.email = input.email.trim().toLowerCase();
    }
    if (input.password !== undefined) {
        if (typeof input.password !== "string" || input.password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" });
        }
        updateData.password = await hashPassword(input.password);
    }
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No supported fields to update" });
    }
    try {
        const user = await User_js_1.default.findByIdAndUpdate(id, updateData, {
            returnDocument: "after",
            runValidators: true,
        })
            .select("-password")
            .lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Error updating user" });
    }
}
async function deleteUser(req, res) {
    if (invalidId(req.params.id, res))
        return;
    const id = routeParam(req.params.id);
    try {
        const user = await User_js_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Error deleting user" });
    }
}
