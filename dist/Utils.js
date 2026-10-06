"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
function hello() {
    return "Hello World";
}
function add(a, b) {
    return a + b;
}
function multiply(a, b) {
    return a * b;
}
function divide(a, b) {
    return a / b;
}
function addUser(name, email, password) {
    email = email.trim();
    if (name.search(" ") !== -1) {
        return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return false;
    }
    return true;
}
exports.utils = {
    hello,
    add,
    multiply,
    divide,
    addUser,
};
