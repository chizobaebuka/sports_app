import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
// import userRouter from "./routes/user";
// import authRouter from "./routes/auth";
// import paymentRouter from "./routes/payment";
import cors from "cors";
import config from "./utils/config";
// import config from "./utils/config";

dotenv.config();
const app = express();
const port = config.PORT;
const db = config.MONGO_URL;

mongoose.set("strictQuery", false);

mongoose
    .connect(db)
    .then(() => console.log("MongoDB Connection Successful"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

app.use(express.json());
app.use(cors({ origin: "*" }));

// app.use("/api/users", userRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/payments", paymentRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
