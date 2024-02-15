// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    phone: string;
    password: string;
    interests: string[];
    verificationCode: string;
    isVerified: boolean;
}

const userSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: String }],
    verificationCode: { type: String },
    isVerified: { type: Boolean, default: false },
});

export default mongoose.model<IUser>('User', userSchema);