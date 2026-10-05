function helloworld(): string {
  return "hello world";
}

function add(a: number, b: number): number {
  return a + b;
}

// เช็กรูปแบบอีเมล
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// เช็กความยาวของรหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)
function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export const utils = {
  helloworld,
  add,
  isValidEmail,
  isValidPassword
};