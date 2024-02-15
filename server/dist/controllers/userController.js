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
exports.verifyUser = exports.registerUser = void 0;
const uuid_1 = require("uuid");
const userModel_1 = __importDefault(require("../models/userModel"));
// import { config } from '../utils/config';
const bcrypt_1 = __importDefault(require("bcrypt"));
const helper_1 = require("../utils/helper");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.email || !req.body.phone || !req.body.password || !req.body.interests) {
        return res.status(400).json({
            message: "Please provide email, phone, password, and interests",
        });
    }
    const otp = (0, uuid_1.v4)().substring(0, 5); // Generate a 5-digit OTP for simplicity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({
            message: "Invalid email address format",
        });
    }
    try {
        const userEmail = yield userModel_1.default.findOne({ email: req.body.email });
        if (userEmail) {
            return res.status(409).json({ message: "Email already exists" });
        }
        const userPhone = yield userModel_1.default.findOne({ phone: req.body.phone });
        if (userPhone) {
            return res.status(409).json({ message: "Phone number already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
        const newUser = new userModel_1.default({
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            interests: req.body.interests,
            verificationCode: otp,
        });
        const savedUser = yield newUser.save();
        const verificationEmailHtml = `<p>Your verification code is: ${otp}</p>`;
        yield (0, helper_1.sendEmail)(savedUser.email, "Verify Your Account", verificationEmailHtml);
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.registerUser = registerUser;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, otp } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (otp !== user.verificationCode) {
            return res.status(401).json({ error: "Invalid OTP" });
        }
        user.isVerified = true;
        user.verificationCode = '';
        yield user.save();
        const username = `${user.firstName} ${user.lastName}`;
        res.status(200).json({ message: "User successfully verified", username });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Verification failed" });
    }
});
exports.verifyUser = verifyUser;
