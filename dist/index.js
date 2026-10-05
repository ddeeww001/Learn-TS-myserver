"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dns_1 = __importDefault(require("dns"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const UserRoute_1 = __importDefault(require("./UserRoute"));
if (process.env.CUSTOM_DNS) {
    const dnsServers = process.env.CUSTOM_DNS.split(',').map(s => s.trim());
    dns_1.default.setServers(dnsServers);
}
else {
    dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
}
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || '';
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// --- ปรับการตั้งค่า Static Path ตรงนี้ ---
// ใช้ path.resolve เพื่อหาตำแหน่งของ public folder ไม่ว่ารันจาก ts-node หรือ node dist
app.use(express_1.default.static(path_1.default.resolve(__dirname, 'public')));
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../src/public')));
// Fallback Route สำหรับเปิด index.html เมื่อเข้าหน้าหลัก
app.get('/', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, 'public/index.html'), (err) => {
        if (err) {
            res.sendFile(path_1.default.resolve(__dirname, '../src/public/index.html'));
        }
    });
});
// Express Routes
app.use('/api', UserRoute_1.default);
mongoose_1.default.connect(mongoUri)
    .then(() => {
    console.log('Connected to MongoDB Atlas successfully!');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
