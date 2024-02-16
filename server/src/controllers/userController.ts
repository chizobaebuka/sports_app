import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/userModel';
// import { config } from '../utils/config';
import bcrypt from 'bcrypt';
import { generateLongString, generateToken, passwordRegex, sendEmail, transporter } from '../utils/helper';
import { generateUsersToken } from '../utils/jwt';
import config from '../utils/config';


export const registerUser = async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.phone || !req.body.password || !req.body.interests) {
        return res.status(400).json({
            message: "Please provide email, phone, password, and interests",
        });
    }

    const otp = uuidv4().substring(0, 5); // Generate a 5-digit OTP for simplicity

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation

    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({
            message: "Invalid email address format",
        });
    }

    try {
        const userEmail = await User.findOne({ email: req.body.email });
        if (userEmail) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const userPhone = await User.findOne({ phone: req.body.phone });
        if (userPhone) {
            return res.status(409).json({ message: "Phone number already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            interests: req.body.interests,
            verificationCode: otp,
        });

        const savedUser = await newUser.save();

        const verificationEmailHtml = `<p>Your verification code is: ${otp}</p>`;
        await sendEmail(savedUser.email, "Verify Your Account", verificationEmailHtml);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const verifyUser = async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (otp !== user.verificationCode) {
            return res.status(401).json({ error: "Invalid OTP" });
        }

        user.isVerified = true;
        user.verificationCode = '';

        await user.save();
        const username = `${user.firstName} ${user.lastName}`;

        res.status(200).json({ message: "User successfully verified", username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Verification failed" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({
            message: "Please provide email and password",
        });
    }

    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            const otp = uuidv4().substring(0, 6);
            user.verificationCode = otp;
            await user.save();

            const verificationEmailHtml = `<p>Your verification OTP is: ${otp}</p>`;
            await sendEmail(user.email, "Verify Your Account", verificationEmailHtml);

            return res.status(401).json({ message: "User not verified. Check your email for the verification OTP." });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const accessToken = generateUsersToken({ id: user._id, email: user.email });

        const { password, ...others } = user.toObject();

        res.status(200).json({ ...others, accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const userChangePassword = async (req: Request, res: Response) => {
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

        const userId = (req as any).user.id;
        const user = await User.findById(userId);

        console.log('user', user);

        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }

        const checkPassword = await bcrypt.compare(oldPassword, user.password);

        if (!checkPassword) {
            return res.status(401).json({
                status: "error",
                method: req.method,
                message: "Old Password is Incorrect",
            });
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.&]{7,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: `Password must be at least 7 characters long and should contain at least one uppercase letter, one lowercase letter, one special character, and one number.`,
            });
        }

        const token = await generateToken({
            id: user.id,
            email: user.email,
        });

        // Assuming you have a method to update the user's password in your MongoDB model
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            message: "You have successfully changed your password",
            id: user.id,
            email: user.email,
            token,
        });
        
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};

export const userForgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }

        const longString = generateLongString(80);

        user.resetToken = longString;
        user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await user.save();

        // Compose the email content
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Reset your password",
            text: `Hi, ${user.firstName} ${user.lastName} \n\nPlease use the following link to reset your password \n\n  ${config.FRONTEND_BASE_URL}/reset-password?token=${longString} `,
        };

        // Send the email
        transporter.sendMail(mailOptions, (err: any, info: { response: string }) => {
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
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};

export const userResetPassword = async (req: Request, res: Response) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const token = req.query.token as string;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: `New Password and Confirm Password Mismatch`,
            });
        }

        const user = await User.findOne({ resetToken: token });

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

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: `Password must be at least 7 characters long and should contain at least one uppercase letter, one lowercase letter, one special character, and one number.`,
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = '';
        user.resetTokenExpiry = new Date();
        await user.save();

        return res.status(200).json({
            message: `Password reset successful`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};

export const userLogout = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: `User not found`,
            });
        }

        return res.status(200).json({
            message: `User successfully logged out`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};