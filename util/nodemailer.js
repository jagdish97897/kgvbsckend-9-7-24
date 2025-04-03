import nodemailer from "nodemailer";
import { config } from "dotenv";

config({ path: "./config/config.env" });

export const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    port: 465,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
    },
});