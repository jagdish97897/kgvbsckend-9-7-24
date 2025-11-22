import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import User from '../models/User.js';
import Order from "../models/Order.js";
import { sendEmailNotification } from "../util/nodemailer.js";

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

// 👉 GET Razorpay Public Key
export const getKey = (req, res) => {
  res.status(200).json({ success: true, key: process.env.RAZORPAY_API_KEY });
};

// 👉 Create Razorpay Order
export const checkout = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    console.log("📦 Razorpay Order Created:", order);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, error: "Unable to create Razorpay order" });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      phone,
      email,
      idProof,
      idNumber,
      vehicleNo,
      model,
      bikeCC,
      chassisNo,
      chargerType,
      batteryType,
      batteryCapacity,
      country,
      state,
      city,
    } = req.body;

    // Required fields validation
    if (
      !razorpay_order_id || !razorpay_payment_id || !razorpay_signature ||
      !name || !phone || !email || !idProof || !idNumber ||
      !vehicleNo || !model || !bikeCC || !chassisNo ||
      !country || !state || !city
    ) {
      return res.status(400).json({
        success: false,
        message: "🚫 Missing required fields",
      });
    }

    // 🔐 Signature verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid Razorpay signature",
      });
    }

    // 💾 Save Order
    const order = await Order.create({
      name,
      phone,
      email,
      idProof,
      idNumber,
      vehicleNo,
      model,
      bikeCC,
      chassisNo,
      chargerType: chargerType || null,
      batteryType: batteryType || null,
      batteryCapacity: batteryCapacity || null,
      country,
      state,
      city,
      branch: city,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // 📬 Get dealer email from User model
    const dealer = await User.findOne({ role: "dealer", branch: city });
    const dealerEmail = dealer?.email || null;

    // 📤 Send emails to both customer and dealer
    await sendEmailNotification({
      name,
      phone,
      email,
      razorpay_order_id,
      razorpay_payment_id,
      dealerEmail,
    });

    return res.status(200).json({
      success: true,
      message: "✅ Payment verified and order saved successfully",
      order,
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "🚨 Server error during payment verification",
      error: error.message,
    });
  }
};



// 👉 Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // most recent first
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// 👉 Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
};
