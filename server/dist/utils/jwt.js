"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateUsersToken = exports.verifyRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.REFRESH_JWT_KEY);
        return decoded;
    }
    catch (error) {
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateUsersToken = (userData) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userData.id, email: userData.email }, config_1.config.JWT_KEY, { expiresIn: "1d" });
    return accessToken;
};
exports.generateUsersToken = generateUsersToken;
const generateRefreshToken = (userData) => {
    const refreshToken = jsonwebtoken_1.default.sign({ id: userData.id, email: userData.email }, config_1.config.REFRESH_JWT_KEY, { expiresIn: "7d" });
    return refreshToken;
};
exports.generateRefreshToken = generateRefreshToken;
