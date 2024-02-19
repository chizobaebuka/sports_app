import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes1";
import cors from "cors";
import config from "./utils/config";
import { connection } from "./utils/dbConnection";
import cookieParser from 'cookie-parser';

connection()

const app = express();

dotenv.config();

const port = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors({ origin: "*" }));

app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
