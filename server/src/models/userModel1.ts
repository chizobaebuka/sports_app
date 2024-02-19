// models/User.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser1 extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    interests: string[];
    resetPasswordCode?: string;
    isVerified: boolean;
    resetToken: string;
    resetTokenExpiry: Date;
}

const UserSchema1: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    interests: [{ type: String }],
    resetPasswordCode: { type: String }, // New field for reset password code
    isVerified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
});

export default mongoose.model<IUser1>('User', UserSchema1);
