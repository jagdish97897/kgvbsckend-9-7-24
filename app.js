import express from "express";
import cors from "cors";
import userRoutes from './routes/userRoutes.js';
import contectRoutes from './routes/contactRoutes.js';
import orderRoutes from "./routes/orderRoutes.js";
import kgvbikeorderRoutes from "./routes/kgvorderRoute.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors('*'));

app.use(express.json());

app.use('/', userRoutes);

app.use('/', contectRoutes);

app.use("/api", orderRoutes);

app.use("/api", kgvbikeorderRoutes);

export default app;