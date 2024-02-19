"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes1_1 = __importDefault(require("./routes/userRoutes1"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./utils/config"));
const dbConnection_1 = require("./utils/dbConnection");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, dbConnection_1.connection)();
const app = (0, express_1.default)();
dotenv_1.default.config();
const port = config_1.default.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: "*" }));
app.use("/users", userRoutes1_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
