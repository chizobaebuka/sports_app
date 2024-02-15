import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/userModel';
// import { config } from '../utils/config';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/helper';


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
