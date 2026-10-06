"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const node_path_1 = __importDefault(require("node:path"));
const UserRoutes_js_1 = __importDefault(require("./UserRoutes.js"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI;
const clientOrigin = process.env.CLIENT_ORIGIN ?? `http://localhost:${port}`;
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, cors_1.default)({ origin: clientOrigin }));
app.use(express_1.default.static(node_path_1.default.join(process.cwd(), "public")));
app.get("/health", (_req, res) => {
    res.send("OK");
});
app.use("/api", UserRoutes_js_1.default);
if (!mongoUri) {
    console.error("MONGODB_URI is not set. Create a .env file first.");
    process.exitCode = 1;
}
else {
    mongoose_1.default
        .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
        .catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exitCode = 1;
    });
}
