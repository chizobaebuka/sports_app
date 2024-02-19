"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateToken = exports.generateRefreshToken = exports.generateUsersToken = exports.verifyRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, `${process.env.REFRESH_JWT_KEY}`);
        return decoded;
    }
    catch (error) {
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateUsersToken = (userData) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userData.id, email: userData.email }, `${process.env.JWT_SECRET_KEY}`, { expiresIn: "1d" });
    return accessToken;
};
exports.generateUsersToken = generateUsersToken;
const generateRefreshToken = (userData) => {
    const refreshToken = jsonwebtoken_1.default.sign({ id: userData.id, email: userData.email }, `${process.env.REFRESH_JWT_KEY}`, { expiresIn: "7d" });
    return refreshToken;
};
exports.generateRefreshToken = generateRefreshToken;
const GenerateToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return jsonwebtoken_1.default.sign(payload, `${process.env.APP_SECRET}!`, { expiresIn: "1d" });
});
exports.GenerateToken = GenerateToken;
