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
exports.generateLongString = exports.generateToken = exports.sendEmail = exports.transporter = exports.passwordRegex = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../utils/config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.&]{7,}$/;
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.default.GMAIL_USER,
        pass: config_1.default.GMAIL_PASS,
    },
});
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    validateEmailParameters(to, subject, html);
    try {
        // Send email
        const response = yield exports.transporter.sendMail({
            from: config_1.default.FROM_ADMIN_EMAIL,
            to,
            subject,
            html,
        });
        return response;
    }
    catch (error) {
        throw error;
    }
});
exports.sendEmail = sendEmail;
const validateEmailParameters = (to, subject, html) => {
    if (to.length < 5 || subject.length < 1 || html.length < 1) {
        let errorMessage = "";
        if (to.length < 5) {
            errorMessage += "Recipient (to) not specified. ";
        }
        if (subject.length < 1) {
            errorMessage += "Subject not specified. ";
        }
        if (html.length < 1) {
            errorMessage += "HTML template not specified.";
        }
        throw new Error(errorMessage.trim());
    }
};
const generateToken = (userData) => {
    const secretKey = config_1.default.SECRET_KEY; // Replace with your actual secret key
    const expiresIn = '1d'; // Token expiration time, you can adjust it based on your needs
    const token = jsonwebtoken_1.default.sign(userData, secretKey, { expiresIn });
    return token;
};
exports.generateToken = generateToken;
const generateLongString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let longString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        longString += characters.charAt(randomIndex);
    }
    return longString;
};
exports.generateLongString = generateLongString;
