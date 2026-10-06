function hello(): string {
    return "Hello World";
}

function add(a: number, b: number): number {
    return a + b;
}

function multiply(a: number, b: number): number {
    return a * b;
}

function divide(a: number, b: number): number {
    return a / b;
}

function addUser(name: string, email: string, password: string) {
    
    email = email.trim();
    if(name.search(" ") !== -1) {
        return false;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regex.test(email)) {
        return false;
    }

    return true;
}
export const utils = {
    hello,
    add,
    multiply,
    divide,
    addUser,
};
     
