import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
// import config from './config';

// const db = config.MONGO_URL;

export const connection = async () => {
    try {
        await mongoose
            .connect(process.env.MONGO_URL as string)
            .then(() => console.log("MongoDB Connection Successful"))

    } catch (err) {
        console.error("MongoDB Connection Error:", err)
    }
};
