"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculate = calculate;
const Utils_js_1 = require("./Utils.js");
function calculate(a, b) {
    return {
        sum: Utils_js_1.utils.add(a, b),
        product: Utils_js_1.utils.multiply(a, b),
        quotient: Utils_js_1.utils.divide(a, b),
    };
}
