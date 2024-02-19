"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    MONGO_URL: process.env.MONGO_URL || '',
    PORT: parseInt(process.env.PORT || '5000', 10),
    SECRET_KEY: process.env.SECRET_KEY || '',
    JWT_KEY: process.env.JWT_KEY || 'myJWTSecret',
    REFRESH_JWT_KEY: process.env.REFRESH_JWT_KEY || '',
    GMAIL_USER: process.env.GMAIL_USER || '',
    GMAIL_PASS: process.env.GMAIL_PASS || '',
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || '',
};
exports.default = exports.config;
