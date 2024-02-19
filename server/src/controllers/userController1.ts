import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import User from '../models/userModel1';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { 
    generateVerificationCode, 
    getNewEmailNotificationHTML, 
    getNewUsernameNotificationHTML, 
    getPreviousEmailNotificationHTML, 
    getPreviousUsernameNotificationHTML, 
    passwordRegex, 
    sendEmail, sendVerificationCode, 
    validateEmailParameters 
} from '../utils/helper';


export const registerUser1: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, interests } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const otp = uuidv4().substring(0, 5);

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            interests,
            resetPasswordCode: otp,
        });

        await newUser.save();

        // Return user information in the response
        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            interests: newUser.interests,
            otpCode: newUser.resetPasswordCode,
        };

        res.status(201).json({ message: 'Registration successful', user: userResponse });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const verifyUserRegistration: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (otp !== user.resetPasswordCode) {
            res.status(401).json({ message: 'Invalid OTP' });
            return;
        }

        user.resetPasswordCode = '';
        await user.save();

        res.status(200).json({ message: 'User successfully verified' });
        return;
    } catch (e) {
        console.error('Error while verifying user registration:', e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const loginUser1: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    try {
        const { loginIdentifier, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ $or: [{ email: loginIdentifier }, { phone: loginIdentifier }] });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate and send JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, `${process.env.JWT_SECRET}`, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const forgotPassword1: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user with the provided email exists
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const verificationCode = generateVerificationCode();

        user.resetPasswordCode = verificationCode;
        await user.save();

        await sendVerificationCode(email, verificationCode);
        res.status(200).json({ message: 'Password reset instructions sent successfully' });
    } catch (error) {
        console.error('Error during forgot password:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const userResetPassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const token = req.query.token as string;

        if (oldPassword === newPassword) {
            return res.status(400).json({
                message: `Old password cannot be the same as ${newPassword}`,
            });
        }

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

        // Send reset success email
        const emailOptions = {
            to: user.email,
            subject: "Password Reset Successful",
            html: `<p>Hi ${user.firstName} ${user.lastName},</p>
                <p>Your password has been successfully reset on ${new Date().toLocaleString()}.</p>`,
        };

        // Validate email parameters before sending
        validateEmailParameters(emailOptions.to, emailOptions.subject, emailOptions.html);

        // Send the email
        await sendEmail(emailOptions.to, emailOptions.subject, emailOptions.html);

        return res.status(200).json({
            message: `Password reset successful. Check your email for confirmation.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};

export const updateUserEmail = async (req: Request, res: Response) => {
    const { newEmail } = req.body;
    const { token } = req.params;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Store the previous email
        const previousEmail = user.email;

        // Update the user's email
        user.email = newEmail;
        await user.save();

        // Send notification emails
        const previousEmailNotification = await sendEmail(previousEmail, 'Email Update Notification', getPreviousEmailNotificationHTML());
        const newEmailNotification = await sendEmail(newEmail, 'Email Update Notification', getNewEmailNotificationHTML());

        res.json({ message: 'Email update successful', updatedEmail: user.email, previousEmailNotification, newEmailNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserUsername = async (req: Request, res: Response) => {
    const { newFirstName, newLastName } = req.body;
    const { token } = req.params;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Store the previous username
        const previousUsername = `${user.firstName} ${user.lastName}`;

        // Update the user's username
        user.firstName = newFirstName;
        user.lastName = newLastName;
        await user.save();

        // Send notification emails
        const previousUsernameNotification = await sendEmail(user.email, 'Username Update Notification', getPreviousUsernameNotificationHTML(previousUsername));
        const newUsernameNotification = await sendEmail(user.email, 'Username Update Notification', getNewUsernameNotificationHTML(`${newFirstName} ${newLastName}`));

        res.json({ message: 'Username update successful', updatedUsername: `${user.firstName} ${user.lastName}`, previousUsernameNotification, newUsernameNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear the user's token
        user.resetToken = '';
        await user.save();

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

