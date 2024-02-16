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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogout = exports.userResetPassword = exports.userForgotPassword = exports.userChangePassword = exports.loginUser = exports.verifyUser = exports.registerUser = void 0;
const uuid_1 = require("uuid");
const userModel_1 = __importDefault(require("../models/userModel"));
// import { config } from '../utils/config';
const bcrypt_1 = __importDefault(require("bcrypt"));
const helper_1 = require("../utils/helper");
const jwt_1 = require("../utils/jwt");
const config_1 = __importDefault(require("../utils/config"));
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
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({
            message: "Please provide email and password",
        });
    }
    try {
        const user = yield userModel_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isVerified) {
            const otp = (0, uuid_1.v4)().substring(0, 6);
            user.verificationCode = otp;
            yield user.save();
            const verificationEmailHtml = `<p>Your verification OTP is: ${otp}</p>`;
            yield (0, helper_1.sendEmail)(user.email, "Verify Your Account", verificationEmailHtml);
            return res.status(401).json({ message: "User not verified. Check your email for the verification OTP." });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const accessToken = (0, jwt_1.generateUsersToken)({ id: user._id, email: user.email });
        const _a = user.toObject(), { password } = _a, others = __rest(_a, ["password"]);
        res.status(200).json(Object.assign(Object.assign({}, others), { accessToken }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.loginUser = loginUser;
const userChangePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: `New Password and Confirm Password Mismatch`,
            });
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({
                message: `Old Password cannot be equal to New Password`,
            });
        }
        const userId = req.user.id;
        const user = yield userModel_1.default.findById(userId);
        console.log('user', user);
        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }
        const checkPassword = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!checkPassword) {
            return res.status(401).json({
                status: "error",
                method: req.method,
                message: "Old Password is Incorrect",
            });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.&]{7,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: `Password must be at least 7 characters long and should contain at least one uppercase letter, one lowercase letter, one special character, and one number.`,
            });
        }
        const token = yield (0, helper_1.generateToken)({
            id: user.id,
            email: user.email,
        });
        // Assuming you have a method to update the user's password in your MongoDB model
        user.password = newPassword;
        yield user.save();
        return res.status(200).json({
            message: "You have successfully changed your password",
            id: user.id,
            email: user.email,
            token,
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
});
exports.userChangePassword = userChangePassword;
const userForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }
        const longString = (0, helper_1.generateLongString)(80);
        user.resetToken = longString;
        user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
        yield user.save();
        // Compose the email content
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Reset your password",
            text: `Hi, ${user.firstName} ${user.lastName} \n\nPlease use the following link to reset your password \n\n  ${config_1.default.FRONTEND_BASE_URL}/reset-password?token=${longString} `,
        };
        // Send the email
        helper_1.transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: `Internal Server Error`,
                });
            }
            console.log(info.response);
            return res.status(200).json({
                message: `Check your email for the reset password link`,
            });
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
});
exports.userForgotPassword = userForgotPassword;
const userResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPassword, confirmPassword } = req.body;
        const token = req.query.token;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: `New Password and Confirm Password Mismatch`,
            });
        }
        const user = yield userModel_1.default.findOne({ resetToken: token });
        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }
        if (user.resetTokenExpiry < new Date()) {
            return res.status(400).json({
                message: `Token has expired. Please request for a new reset link`,
            });
        }
        if (!helper_1.passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: `Password must be at least 7 characters long and should contain at least one uppercase letter, one lowercase letter, one special character, and one number.`,
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = '';
        user.resetTokenExpiry = new Date();
        yield user.save();
        return res.status(200).json({
            message: `Password reset successful`,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
});
exports.userResetPassword = userResetPassword;
const userLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }
        return res.status(200).json({
            message: `User successfully logged out`,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
});
exports.userLogout = userLogout;
