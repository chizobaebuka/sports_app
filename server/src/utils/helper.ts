import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();
// import config from "../utils/config";

// interface UserData {
//     id: string; // or number, depending on your user model
//     email: string;
// }

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.&]{7,}$/;


export const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "smtp-mail.outlook.com",
    // port: 587,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
    secure: false,
});

transporter.verify((error) => {
    if (error) {
        console.error('Error connecting to the mail server:', error);
    } else {
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

export const sendRegistrationEmail = async (
    to: string,
    user: { firstName: string; lastName: string },
    url: string
) => {
    const longString = generateLongString(32);

    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject: "Reset your password",
        text: `Hi ${user.firstName} ${user.lastName},\n\nWelcome to our platform! We're excited to have you on board.\n\nThank you for registering. Please use the following link to complete your registration:\n\n${url}\n\nIf you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nThe [Your Platform Name] Team. Find your token here: ${longString}`,
    };

    await transporter.sendMail(mailOptions);
};

// export const generateToken = (userData: UserData): string => {
//     const secretKey = config.SECRET_KEY; // Replace with your actual secret key
//     const expiresIn = '1d'; // Token expiration time, you can adjust it based on your needs

//     const token = jwt.sign(userData, secretKey, { expiresIn });

//     return token;
// };

export const generateLongString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let longString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        longString += characters.charAt(randomIndex);
    }
    return longString;
};

export const sendSuccessEmail = async (to: string, html: string) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject: "Registration Successful",
        html,
    };

    await transporter.sendMail(mailOptions);
};


// ??????????????????????????????????????????????????????????????????????????????????????????????
// userRoutes1

export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationCode = async (to: string, code: string): Promise<void> => {
    const mailOptions = {
        from: `${process.env.MAIL_USER}`,
        to,
        subject: 'Password Reset Verification Code',
        text: `Your verification code is: ${code}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification code email sent successfully');
    } catch (error) {
        console.error('Error sending verification code email:', error);
        throw new Error('Failed to send verification code email');
    }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    validateEmailParameters(to, subject, html);
    try {
        // Send email
        const response = await transporter.sendMail({
            from: `${process.env.GMAIL_USER}`,
            to,
            subject,
            html,
        });

        return response;
    } catch (error) {
        throw error;
    }
};

export const validateEmailParameters = (to: string, subject: string, html: string) => {
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

export const getPreviousEmailNotificationHTML = (): string => {
    // Customize the HTML content for the previous email notification
    return `<p>You have successfully updated your email address from the previous email to the new one.</p>`;
};

export const getNewEmailNotificationHTML = (): string => {
    // Customize the HTML content for the new email notification
    return `<p>Your email address has been updated. If you did not make this change, please contact us immediately.</p>`;
};

export const getPreviousUsernameNotificationHTML = (previousUsername: string): string => {
    return `<p>Your username has been updated from ${previousUsername}.</p>`;
};

export const getNewUsernameNotificationHTML = (newUsername: string): string => {
    return `<p>Your username has been successfully updated to ${newUsername}.</p>`;
};