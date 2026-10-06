import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "./User.js";

const scrypt = promisify(scryptCallback);

type UserInput = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

function publicUser(user: Record<string, unknown>) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function isValidUserInput(input: UserInput) {
  return (
    typeof input.name === "string" &&
    input.name.trim().length > 0 &&
    typeof input.email === "string" &&
    input.email.trim().length > 0 &&
    typeof input.password === "string" &&
    input.password.length >= 6
  );
}

function routeParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function invalidId(id: string | string[], res: Response) {
  const normalizedId = routeParam(id);

  if (!mongoose.isValidObjectId(normalizedId)) {
    res.status(400).json({ message: "Invalid user id" });
    return true;
  }

  return false;
}

export async function createUser(req: Request, res: Response) {
  const input = (req.body ?? {}) as UserInput;

  if (!isValidUserInput(input)) {
    return res.status(400).json({
      message: "name and email are required; password must be at least 6 characters",
    });
  }

  try {
    const name = input.name as string;
    const email = input.email as string;
    const password = input.password as string;
    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
    });

    return res.status(201).json(publicUser(user.toObject()));
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user" });
  }
}

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({ message: "Error retrieving users" });
  }
}

export async function getUserById(req: Request, res: Response) {
  if (invalidId(req.params.id, res)) return;
  const id = routeParam(req.params.id);

  try {
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({ message: "Error retrieving user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  if (invalidId(req.params.id, res)) return;
  const id = routeParam(req.params.id);

  const input = (req.body ?? {}) as UserInput;
  const updateData: Record<string, string> = {};

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
    const user = await User.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error updating user" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  if (invalidId(req.params.id, res)) return;
  const id = routeParam(req.params.id);

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Error deleting user" });
  }
}
