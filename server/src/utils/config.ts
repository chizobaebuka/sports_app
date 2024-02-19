import dotenv from 'dotenv';
dotenv.config();

export const config = {
    MONGO_URL: process.env.MONGO_URL || '',
    PORT: parseInt(process.env.PORT || '5000', 10),
    SECRET_KEY: process.env.SECRET_KEY || '',
    JWT_KEY: process.env.JWT_KEY || 'myJWTSecret',
    REFRESH_JWT_KEY: process.env.REFRESH_JWT_KEY || '',
    GMAIL_USER: process.env.GMAIL_USER || '',
    GMAIL_PASS: process.env.GMAIL_PASS || '',
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || '',
};

export default config;
