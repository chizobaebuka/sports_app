import jwt, { Jwt, JwtPayload, Secret } from "jsonwebtoken";
import { config } from "./config";
interface UserData {
    id: number;
    email: string;
}

export const verifyRefreshToken = (token: string): UserData => {
    try {
        const decoded = jwt.verify(token, config.REFRESH_JWT_KEY as Secret) as Jwt & JwtPayload & UserData;
        return decoded;
    } catch (error) {
        throw error;
    }
};

export const generateUsersToken = (userData: UserData): string => {
    const accessToken = jwt.sign({ id: userData.id, email: userData.email }, config.JWT_KEY as Secret, { expiresIn: "1d" });
    return accessToken;
};

export const generateRefreshToken = (userData: UserData): string => {
    const refreshToken = jwt.sign({ id: userData.id, email: userData.email }, config.REFRESH_JWT_KEY as Secret, { expiresIn: "7d" });
    return refreshToken;
};
