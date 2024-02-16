import nodemailer from "nodemailer";
import config from "../utils/config";
import jwt from "jsonwebtoken";

interface UserData {
    id: string; // or number, depending on your user model
    email: string;
}

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.&]{7,}$/;


export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    validateEmailParameters(to, subject, html);
    try {
        // Send email
        const response = await transporter.sendMail({
            from: config.FROM_ADMIN_EMAIL,
            to,
            subject,
            html,
        });

        return response;
    } catch (error) {
        throw error;
    }
};

const validateEmailParameters = (to: string, subject: string, html: string) => {
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


export const generateToken = (userData: UserData): string => {
    const secretKey = config.SECRET_KEY; // Replace with your actual secret key
    const expiresIn = '1d'; // Token expiration time, you can adjust it based on your needs

    const token = jwt.sign(userData, secretKey, { expiresIn });

    return token;
};

export const generateLongString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let longString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        longString += characters.charAt(randomIndex);
    }
    return longString;
};