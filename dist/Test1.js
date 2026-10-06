"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_js_1 = require("./Utils.js");
const unit_test = async () => {
    if (Utils_js_1.utils.add(2, 3) === 5) {
        console.log("Test passed!");
    }
    else {
        console.log("Test failed: utils.add(2, 3) === 5 ");
        process.exit(1);
    }
    if (Utils_js_1.utils.add(2, 2) === 4) {
        console.log("Test passed!");
    }
    else {
        console.log("Case 2 Failed: Expected 4 but got wrong value");
        process.exit(1);
    }
    if (Utils_js_1.utils.multiply(2, 3) === 6) {
        console.log("Test passed!");
    }
    else {
        console.log("Case 3 Failed: Expected 6 but got wrong value");
        process.exit(1);
    }
    if (Utils_js_1.utils.divide(6, 3) === 2) {
        console.log("Test passed!");
    }
    else {
        console.log("Case 4 Failed: Expected 2 but got wrong value");
        process.exit(1);
    }
    if (Utils_js_1.utils.addUser("Suphakon", "suphakon@gmail.com", "1212312121")) {
        console.log("Test passed!");
    }
    else {
        console.log("Case 5 Failed: Expected true but got false");
        process.exit(1);
    }
};
unit_test();
