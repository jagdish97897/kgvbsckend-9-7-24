import express from "express";

import { app } from "./app.js";
import Razorpay from "razorpay"; 
import { connectDB } from "./config/database.js";
import path from "path"; // Add this line


connectDB();

if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_APT_SECRET) {
  console.error("Please provide RAZORPAY_API_KEY and RAZORPAY_APT_SECRET in your environment variables.");
  process.exit(1);
}

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});



const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname1, "frntend", "build")));

  app.get("*", (req, res) => {
    console.log("ok");
    res.sendFile(path.resolve(__dirname1, "frntend", "build", "index.html"));
  });
} else {
    app.get('/', (req, res) => {
        res.end('API Running');
    });
}


app.listen(process.env.PORT, () =>
  console.log(`Server is working on ${process.env.PORT}`)
);









