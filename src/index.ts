import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dns from 'dns';
import path from 'path';
import 'dotenv/config';
import userRoutes from './UserRoute';

if (process.env.CUSTOM_DNS) {
  const dnsServers = process.env.CUSTOM_DNS.split(',').map(s => s.trim());
  dns.setServers(dnsServers);
} else {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || '';

app.use(express.json());
app.use(cors());

// --- ปรับการตั้งค่า Static Path ตรงนี้ ---
// ใช้ path.resolve เพื่อหาตำแหน่งของ public folder ไม่ว่ารันจาก ts-node หรือ node dist
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, '../src/public')));

// Fallback Route สำหรับเปิด index.html เมื่อเข้าหน้าหลัก
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'), (err) => {
    if (err) {
      res.sendFile(path.resolve(__dirname, '../src/public/index.html'));
    }
  });
});

// Express Routes
app.use('/api', userRoutes);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully!');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });