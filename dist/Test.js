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
const os_1 = __importDefault(require("os"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const UserRoute_1 = __importDefault(require("./UserRoute"));
const User_1 = __importDefault(require("./User"));
const Utils_1 = require("./Utils");
const globals_1 = require("@jest/globals");
// ใช้ MongoMemoryServer แทน MongoDB จริง => ไม่ต้องใช้ .env / MONGODB_URI
// ทำให้รันได้ทั้งในเครื่องและบน GitHub Actions
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', UserRoute_1.default);
let mongoServer;
// helper สำหรับสร้างผู้ใช้ผ่าน API
const createUser = (data) => (0, supertest_1.default)(app).post('/api/users').send(data);
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
(0, globals_1.describe)('Utils Functions Unit Tests', () => {
    (0, globals_1.test)('helloworld() ควรคืนค่า "hello world"', () => {
        (0, globals_1.expect)(Utils_1.utils.helloworld()).toBe('hello world');
    });
    (0, globals_1.test)('add() ควรบวกตัวเลขถูกต้อง', () => {
        (0, globals_1.expect)(Utils_1.utils.add(2, 3)).toBe(5);
        (0, globals_1.expect)(Utils_1.utils.add(-1, 1)).toBe(0);
        (0, globals_1.expect)(Utils_1.utils.add(0, 0)).toBe(0);
        (0, globals_1.expect)(Utils_1.utils.add(1.5, 2.5)).toBe(4);
    });
    globals_1.test.each([
        ['test@example.com', true],
        ['first.last@sub.domain.co.th', true],
        ['invalid-email', false],
        ['no-at-sign.com', false],
        ['user@nodot', false],
        ['user @example.com', false],
        ['', false],
    ])('isValidEmail(%p) ควรได้ %p', (email, expected) => {
        (0, globals_1.expect)(Utils_1.utils.isValidEmail(email)).toBe(expected);
    });
    globals_1.test.each([
        ['123456', true],
        ['a-very-long-password', true],
        ['12345', false],
        ['', false],
    ])('isValidPassword(%p) ควรได้ %p', (password, expected) => {
        (0, globals_1.expect)(Utils_1.utils.isValidPassword(password)).toBe(expected);
    });
});
// ---------------------------------------------------------------------------
// Integration tests: User API + MongoDB
// ---------------------------------------------------------------------------
(0, globals_1.describe)('User API & MongoDB Integration Tests', () => {
    (0, globals_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        // mongodb driver 7.6.x มีบั๊กเมื่อรันใน Jest (Missing required sub-document 'driver')
        // แก้โดยส่ง module `os` ตัวจริงให้ driver ผ่าน runtimeAdapters
        yield mongoose_1.default.connect(mongoServer.getUri(), {
            runtimeAdapters: { os: os_1.default },
        });
        // ให้แน่ใจว่า unique index ของ email ถูกสร้างก่อนเริ่ม test
        yield User_1.default.init();
    }), DB_SETUP_TIMEOUT);
    (0, globals_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
        if (mongoServer) {
            yield mongoServer.stop();
        }
    }), 30000);
    (0, globals_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            yield collections[key].deleteMany({});
        }
    }));
    // ---------------- CREATE ----------------
    (0, globals_1.describe)('POST /api/users', () => {
        (0, globals_1.test)('สร้างผู้ใช้ใหม่สำเร็จเมื่อข้อมูลถูกต้อง', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield createUser(validUser);
            (0, globals_1.expect)(res.status).toBe(201);
            (0, globals_1.expect)(res.body).toHaveProperty('_id');
            (0, globals_1.expect)(res.body.name).toBe(validUser.name);
            (0, globals_1.expect)(res.body.email).toBe(validUser.email);
            // ตรวจว่าบันทึกลง DB จริง
            const inDb = yield User_1.default.findById(res.body._id);
            (0, globals_1.expect)(inDb).not.toBeNull();
            (0, globals_1.expect)(inDb === null || inDb === void 0 ? void 0 : inDb.email).toBe(validUser.email);
        }));
        (0, globals_1.test)('ไม่ควรสร้างผู้ใช้หากอีเมลผิดรูปแบบ', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield createUser(Object.assign(Object.assign({}, validUser), { email: 'bad-email' }));
            (0, globals_1.expect)(res.status).toBe(400);
            (0, globals_1.expect)(res.body.message).toBe('รูปแบบอีเมลไม่ถูกต้อง');
            (0, globals_1.expect)(yield User_1.default.countDocuments()).toBe(0);
        }));
        (0, globals_1.test)('ไม่ควรสร้างผู้ใช้หากรหัสผ่านสั้นกว่า 6 ตัวอักษร', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield createUser(Object.assign(Object.assign({}, validUser), { password: '123' }));
            (0, globals_1.expect)(res.status).toBe(400);
            (0, globals_1.expect)(res.body.message).toBe('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            (0, globals_1.expect)(yield User_1.default.countDocuments()).toBe(0);
        }));
        globals_1.test.each(['name', 'email', 'password'])('ไม่ควรสร้างผู้ใช้หากไม่มีฟิลด์ %s', (field) => __awaiter(void 0, void 0, void 0, function* () {
            const data = Object.assign({}, validUser);
            delete data[field];
            const res = yield createUser(data);
            (0, globals_1.expect)(res.status).toBe(400);
            (0, globals_1.expect)(yield User_1.default.countDocuments()).toBe(0);
        }));
        (0, globals_1.test)('ไม่ควรสร้างผู้ใช้ซ้ำหากอีเมลถูกใช้แล้ว', () => __awaiter(void 0, void 0, void 0, function* () {
            yield createUser(validUser);
            const res = yield createUser(Object.assign(Object.assign({}, validUser), { name: 'Another' }));
            (0, globals_1.expect)(res.status).toBe(409);
            (0, globals_1.expect)(res.body.message).toBe('อีเมลนี้ถูกใช้งานแล้ว');
            (0, globals_1.expect)(yield User_1.default.countDocuments()).toBe(1);
        }));
    });
    // ---------------- READ ALL ----------------
    (0, globals_1.describe)('GET /api/users', () => {
        (0, globals_1.test)('คืน array ว่างเมื่อยังไม่มีผู้ใช้', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get('/api/users');
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body).toEqual([]);
        }));
        (0, globals_1.test)('ดึงรายการผู้ใช้ทั้งหมด', () => __awaiter(void 0, void 0, void 0, function* () {
            yield createUser({ name: 'User One', email: 'user1@example.com', password: 'password123' });
            yield createUser({ name: 'User Two', email: 'user2@example.com', password: 'password123' });
            const res = yield (0, supertest_1.default)(app).get('/api/users');
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(Array.isArray(res.body)).toBe(true);
            (0, globals_1.expect)(res.body.length).toBe(2);
            const emails = res.body.map((u) => u.email).sort();
            (0, globals_1.expect)(emails).toEqual(['user1@example.com', 'user2@example.com']);
        }));
    });
    // ---------------- READ ONE ----------------
    (0, globals_1.describe)('GET /api/users/:id', () => {
        (0, globals_1.test)('ดึงผู้ใช้ตาม id ได้ถูกต้อง', () => __awaiter(void 0, void 0, void 0, function* () {
            const created = yield createUser(validUser);
            const res = yield (0, supertest_1.default)(app).get(`/api/users/${created.body._id}`);
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body._id).toBe(created.body._id);
            (0, globals_1.expect)(res.body.email).toBe(validUser.email);
        }));
        (0, globals_1.test)('คืน 404 เมื่อไม่พบผู้ใช้', () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(app).get(`/api/users/${fakeId}`);
            (0, globals_1.expect)(res.status).toBe(404);
            (0, globals_1.expect)(res.body.message).toBe('User not found');
        }));
        (0, globals_1.test)('คืน 400 เมื่อ id ไม่ถูกรูปแบบ', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get('/api/users/not-a-valid-id');
            (0, globals_1.expect)(res.status).toBe(400);
            (0, globals_1.expect)(res.body.message).toBe('Invalid user id');
        }));
    });
    // ---------------- UPDATE ----------------
    (0, globals_1.describe)('PUT /api/users/:id', () => {
        (0, globals_1.test)('แก้ไขข้อมูลผู้ใช้สำเร็จ', () => __awaiter(void 0, void 0, void 0, function* () {
            const created = yield createUser(validUser);
            const res = yield (0, supertest_1.default)(app)
                .put(`/api/users/${created.body._id}`)
                .send({ name: 'Updated Name' });
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.name).toBe('Updated Name');
            (0, globals_1.expect)(res.body.email).toBe(validUser.email);
            const inDb = yield User_1.default.findById(created.body._id);
            (0, globals_1.expect)(inDb === null || inDb === void 0 ? void 0 : inDb.name).toBe('Updated Name');
        }));
        (0, globals_1.test)('คืน 404 เมื่อแก้ไขผู้ใช้ที่ไม่มีอยู่', () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(app).put(`/api/users/${fakeId}`).send({ name: 'X' });
            (0, globals_1.expect)(res.status).toBe(404);
            (0, globals_1.expect)(res.body.message).toBe('User not found');
        }));
        (0, globals_1.test)('คืน 400 เมื่อ id ไม่ถูกรูปแบบ', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).put('/api/users/123').send({ name: 'X' });
            (0, globals_1.expect)(res.status).toBe(400);
        }));
    });
    // ---------------- DELETE ----------------
    (0, globals_1.describe)('DELETE /api/users/:id', () => {
        (0, globals_1.test)('ลบผู้ใช้สำเร็จ', () => __awaiter(void 0, void 0, void 0, function* () {
            const created = yield createUser(validUser);
            const res = yield (0, supertest_1.default)(app).delete(`/api/users/${created.body._id}`);
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.message).toBe('User deleted');
            (0, globals_1.expect)(yield User_1.default.findById(created.body._id)).toBeNull();
        }));
        (0, globals_1.test)('คืน 404 เมื่อลบผู้ใช้ที่ไม่มีอยู่', () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(app).delete(`/api/users/${fakeId}`);
            (0, globals_1.expect)(res.status).toBe(404);
            (0, globals_1.expect)(res.body.message).toBe('User not found');
        }));
        (0, globals_1.test)('คืน 400 เมื่อ id ไม่ถูกรูปแบบ', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).delete('/api/users/abc');
            (0, globals_1.expect)(res.status).toBe(400);
        }));
    });
});
