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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const UserRoutes_1 = __importDefault(require("./UserRoutes"));
const Utils_1 = require("./Utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', UserRoutes_1.default);
let mongoServer;
// ก่อนเริ่มการทดสอบทั้งหมด: เริ่มต้นจำลอง MongoDB ใน Memory
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    yield mongoose_1.default.connect(mongoUri);
}));
// หลังจบการทดสอบทั้งหมด: ปิดการเชื่อมต่อ และหยุด MongoDB
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
// เคลียร์ข้อมูลใน Database หลังจบแต่ละ Test Case
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        yield collections[key].deleteMany({});
    }
}));
// -------------------------------------------------------------
// 1. Unit Test สำหรับ Utils.ts
// -------------------------------------------------------------
describe('Utils Function Tests', () => {
    test('helloworld() ควรคืนค่า "hello world"', () => {
        expect(Utils_1.utils.helloworld()).toBe('hello world');
    });
    test('add() ควรบวกเลขถูกต้อง', () => {
        expect(Utils_1.utils.add(2, 3)).toBe(5);
    });
    test('isValidEmail() ควรตรวจสอบอีเมลถูกต้อง', () => {
        expect(Utils_1.utils.isValidEmail('test@example.com')).toBe(true);
        expect(Utils_1.utils.isValidEmail('invalid-email')).toBe(false);
    });
    test('isValidPassword() ควรตรวจสอบความยาวรหัสผ่านถูกต้อง', () => {
        expect(Utils_1.utils.isValidPassword('123456')).toBe(true);
        expect(Utils_1.utils.isValidPassword('12345')).toBe(false);
    });
});
// -------------------------------------------------------------
// 2. Integration / Unit Test สำหรับ MongoDB & User API
// -------------------------------------------------------------
describe('User API & MongoDB Integration Tests', () => {
    test('POST /api/users - สร้างผู้ใช้ใหม่สำเร็จเมื่อข้อมูลถูกต้อง', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/users')
            .send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe('Test User');
        expect(res.body.email).toBe('testuser@example.com');
    }));
    test('POST /api/users - ไม่ควรสร้างผู้ใช้หากอีเมลผิดรูปแบบ', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/users')
            .send({
            name: 'Test User',
            email: 'bad-email',
            password: 'password123'
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('รูปแบบอีเมลไม่ถูกต้อง');
    }));
    test('GET /api/users - ดึงรายการผู้ใช้ทั้งหมด', () => __awaiter(void 0, void 0, void 0, function* () {
        // สร้างผู้ใช้ก่อน 1 คน
        yield (0, supertest_1.default)(app)
            .post('/api/users')
            .send({
            name: 'User One',
            email: 'user1@example.com',
            password: 'password123'
        });
        const res = yield (0, supertest_1.default)(app).get('/api/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].email).toBe('user1@example.com');
    }));
});
