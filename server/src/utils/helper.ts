import nodemailer from "nodemailer";
import config from "../utils/config";

const transporter = nodemailer.createTransport({
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

