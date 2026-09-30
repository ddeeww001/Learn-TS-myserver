"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const experss = require("express");
const app = experss;
const port = 3000;
app.get('/', (req, res) => {
    res.send('hello world');
});
port.listen(port, () => {
    console.log(`server isruning at http://localhost:${port}`);
});
