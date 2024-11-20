import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config("../.env")
const app = express();

app.use(express.json());
app.use(cookieParser());
connectDB();

app.get("/", (req, res) => {
    res.send("Hello Backend!!");
})

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is Running on PORT ${process.env.PORT || 5000}`);
})