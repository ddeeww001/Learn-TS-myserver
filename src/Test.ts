import os from 'os';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import userRoutes from './UserRoute';
import User from './User';
import { utils } from './Utils';
import { describe, test, expect, beforeAll, afterAll, afterEach } from '@jest/globals';

// ใช้ MongoMemoryServer แทน MongoDB จริง => ไม่ต้องใช้ .env / MONGODB_URI
// ทำให้รันได้ทั้งในเครื่องและบน GitHub Actions
const app = express();
app.use(express.json());
app.use('/api', userRoutes);

let mongoServer: MongoMemoryServer;

// helper สำหรับสร้างผู้ใช้ผ่าน API
const createUser = (data: Record<string, unknown>) =>
  request(app).post('/api/users').send(data);

const validUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
};

// ครั้งแรก mongodb-memory-server ต้องดาวน์โหลด mongod (~100MB) จึงตั้ง timeout ไว้สูง
const DB_SETUP_TIMEOUT = 180000;

// ---------------------------------------------------------------------------
// Unit tests: Utils
// ---------------------------------------------------------------------------
describe('Utils Functions Unit Tests', () => {
  test('helloworld() ควรคืนค่า "hello world"', () => {
    expect(utils.helloworld()).toBe('hello world');
  });

  test('add() ควรบวกตัวเลขถูกต้อง', () => {
    expect(utils.add(2, 3)).toBe(5);
    expect(utils.add(-1, 1)).toBe(0);
    expect(utils.add(0, 0)).toBe(0);
    expect(utils.add(1.5, 2.5)).toBe(4);
  });

  test.each([
    ['test@example.com', true],
    ['first.last@sub.domain.co.th', true],
    ['invalid-email', false],
    ['no-at-sign.com', false],
    ['user@nodot', false],
    ['user @example.com', false],
    ['', false],
  ])('isValidEmail(%p) ควรได้ %p', (email, expected) => {
    expect(utils.isValidEmail(email)).toBe(expected);
  });

  test.each([
    ['123456', true],
    ['a-very-long-password', true],
    ['12345', false],
    ['', false],
  ])('isValidPassword(%p) ควรได้ %p', (password, expected) => {
    expect(utils.isValidPassword(password)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Integration tests: User API + MongoDB
// ---------------------------------------------------------------------------
describe('User API & MongoDB Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    // mongodb driver 7.6.x มีบั๊กเมื่อรันใน Jest (Missing required sub-document 'driver')
    // แก้โดยส่ง module `os` ตัวจริงให้ driver ผ่าน runtimeAdapters
    await mongoose.connect(mongoServer.getUri(), {
      runtimeAdapters: { os },
    } as mongoose.ConnectOptions);
    // ให้แน่ใจว่า unique index ของ email ถูกสร้างก่อนเริ่ม test
    await User.init();
  }, DB_SETUP_TIMEOUT);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
  // ---------------- CREATE ----------------
  describe('POST /api/users', () => {
    test('สร้างผู้ใช้ใหม่สำเร็จเมื่อข้อมูลถูกต้อง', async () => {
      const res = await createUser(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(validUser.name);
      expect(res.body.email).toBe(validUser.email);

      // ตรวจว่าบันทึกลง DB จริง
      const inDb = await User.findById(res.body._id);
      expect(inDb).not.toBeNull();
      expect(inDb?.email).toBe(validUser.email);
    });

    test('ไม่ควรสร้างผู้ใช้หากอีเมลผิดรูปแบบ', async () => {
      const res = await createUser({ ...validUser, email: 'bad-email' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('รูปแบบอีเมลไม่ถูกต้อง');
      expect(await User.countDocuments()).toBe(0);
    });

    test('ไม่ควรสร้างผู้ใช้หากรหัสผ่านสั้นกว่า 6 ตัวอักษร', async () => {
      const res = await createUser({ ...validUser, password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      expect(await User.countDocuments()).toBe(0);
    });

    test.each(['name', 'email', 'password'])(
      'ไม่ควรสร้างผู้ใช้หากไม่มีฟิลด์ %s',
      async (field) => {
        const data: Record<string, unknown> = { ...validUser };
        delete data[field];

        const res = await createUser(data);

        expect(res.status).toBe(400);
        expect(await User.countDocuments()).toBe(0);
      }
    );

    test('ไม่ควรสร้างผู้ใช้ซ้ำหากอีเมลถูกใช้แล้ว', async () => {
      await createUser(validUser);
      const res = await createUser({ ...validUser, name: 'Another' });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('อีเมลนี้ถูกใช้งานแล้ว');
      expect(await User.countDocuments()).toBe(1);
    });
  });

  // ---------------- READ ALL ----------------
  describe('GET /api/users', () => {
    test('คืน array ว่างเมื่อยังไม่มีผู้ใช้', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('ดึงรายการผู้ใช้ทั้งหมด', async () => {
      await createUser({ name: 'User One', email: 'user1@example.com', password: 'password123' });
      await createUser({ name: 'User Two', email: 'user2@example.com', password: 'password123' });

      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      const emails = res.body.map((u: { email: string }) => u.email).sort();
      expect(emails).toEqual(['user1@example.com', 'user2@example.com']);
    });
  });

  // ---------------- READ ONE ----------------
  describe('GET /api/users/:id', () => {
    test('ดึงผู้ใช้ตาม id ได้ถูกต้อง', async () => {
      const created = await createUser(validUser);

      const res = await request(app).get(`/api/users/${created.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(created.body._id);
      expect(res.body.email).toBe(validUser.email);
    });

    test('คืน 404 เมื่อไม่พบผู้ใช้', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/users/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('คืน 400 เมื่อ id ไม่ถูกรูปแบบ', async () => {
      const res = await request(app).get('/api/users/not-a-valid-id');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid user id');
    });
  });

  // ---------------- UPDATE ----------------
  describe('PUT /api/users/:id', () => {
    test('แก้ไขข้อมูลผู้ใช้สำเร็จ', async () => {
      const created = await createUser(validUser);

      const res = await request(app)
        .put(`/api/users/${created.body._id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.email).toBe(validUser.email);

      const inDb = await User.findById(created.body._id);
      expect(inDb?.name).toBe('Updated Name');
    });

    test('คืน 404 เมื่อแก้ไขผู้ใช้ที่ไม่มีอยู่', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).put(`/api/users/${fakeId}`).send({ name: 'X' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('คืน 400 เมื่อ id ไม่ถูกรูปแบบ', async () => {
      const res = await request(app).put('/api/users/123').send({ name: 'X' });

      expect(res.status).toBe(400);
    });
  });

  // ---------------- DELETE ----------------
  describe('DELETE /api/users/:id', () => {
    test('ลบผู้ใช้สำเร็จ', async () => {
      const created = await createUser(validUser);

      const res = await request(app).delete(`/api/users/${created.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted');
      expect(await User.findById(created.body._id)).toBeNull();
    });

    test('คืน 404 เมื่อลบผู้ใช้ที่ไม่มีอยู่', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/users/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('คืน 400 เมื่อ id ไม่ถูกรูปแบบ', async () => {
      const res = await request(app).delete('/api/users/abc');

      expect(res.status).toBe(400);
    });
  });
});