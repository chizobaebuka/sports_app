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
exports.getNewUsernameNotificationHTML = exports.getPreviousUsernameNotificationHTML = exports.getNewEmailNotificationHTML = exports.getPreviousEmailNotificationHTML = exports.validateEmailParameters = exports.sendEmail = exports.sendVerificationCode = exports.generateVerificationCode = exports.sendSuccessEmail = exports.generateLongString = exports.sendRegistrationEmail = exports.transporter = exports.passwordRegex = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// import config from "../utils/config";
// interface UserData {
//     id: string; // or number, depending on your user model
//     email: string;
// }
exports.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.&]{7,}$/;
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    // host: "smtp-mail.outlook.com",
    // port: 587,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
    secure: false,
});
exports.transporter.verify((error) => {
    if (error) {
        console.error('Error connecting to the mail server:', error);
    }
    else {
        console.log('Mail server connection is ready to take our messages');
    }
});
// export const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: `${process.env.GMAIL_USER}`,
//         pass: `${process.env.GMAIL_PASSWORD}`,
//     },
// });
const sendRegistrationEmail = (to, user, url) => __awaiter(void 0, void 0, void 0, function* () {
    const longString = (0, exports.generateLongString)(32);
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject: "Reset your password",
        text: `Hi ${user.firstName} ${user.lastName},\n\nWelcome to our platform! We're excited to have you on board.\n\nThank you for registering. Please use the following link to complete your registration:\n\n${url}\n\nIf you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nThe [Your Platform Name] Team. Find your token here: ${longString}`,
    };
    yield exports.transporter.sendMail(mailOptions);
});
exports.sendRegistrationEmail = sendRegistrationEmail;
// export const generateToken = (userData: UserData): string => {
//     const secretKey = config.SECRET_KEY; // Replace with your actual secret key
//     const expiresIn = '1d'; // Token expiration time, you can adjust it based on your needs
//     const token = jwt.sign(userData, secretKey, { expiresIn });
//     return token;
// };
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
const sendSuccessEmail = (to, html) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject: "Registration Successful",
        html,
    };
    yield exports.transporter.sendMail(mailOptions);
});
exports.sendSuccessEmail = sendSuccessEmail;
// ??????????????????????????????????????????????????????????????????????????????????????????????
// userRoutes1
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
const sendVerificationCode = (to, code) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `${process.env.MAIL_USER}`,
        to,
        subject: 'Password Reset Verification Code',
        text: `Your verification code is: ${code}`,
    };
    try {
        yield exports.transporter.sendMail(mailOptions);
        console.log('Verification code email sent successfully');
    }
    catch (error) {
        console.error('Error sending verification code email:', error);
        throw new Error('Failed to send verification code email');
    }
});
exports.sendVerificationCode = sendVerificationCode;
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    (0, exports.validateEmailParameters)(to, subject, html);
    try {
        // Send email
        const response = yield exports.transporter.sendMail({
            from: `${process.env.GMAIL_USER}`,
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
exports.validateEmailParameters = validateEmailParameters;
const getPreviousEmailNotificationHTML = () => {
    // Customize the HTML content for the previous email notification
    return `<p>You have successfully updated your email address from the previous email to the new one.</p>`;
};
exports.getPreviousEmailNotificationHTML = getPreviousEmailNotificationHTML;
const getNewEmailNotificationHTML = () => {
    // Customize the HTML content for the new email notification
    return `<p>Your email address has been updated. If you did not make this change, please contact us immediately.</p>`;
};
exports.getNewEmailNotificationHTML = getNewEmailNotificationHTML;
const getPreviousUsernameNotificationHTML = (previousUsername) => {
    return `<p>Your username has been updated from ${previousUsername}.</p>`;
};
exports.getPreviousUsernameNotificationHTML = getPreviousUsernameNotificationHTML;
const getNewUsernameNotificationHTML = (newUsername) => {
    return `<p>Your username has been successfully updated to ${newUsername}.</p>`;
};
exports.getNewUsernameNotificationHTML = getNewUsernameNotificationHTML;
