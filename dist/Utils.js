"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
function helloworld() {
    return "hello world";
}
function add(a, b) {
    return a + b;
}
// เช็กรูปแบบอีเมล
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// เช็กความยาวของรหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)
function isValidPassword(password) {
    return password.length >= 6;
}
exports.utils = {
    helloworld,
    add,
    isValidEmail,
    isValidPassword
};
