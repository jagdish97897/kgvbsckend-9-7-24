import KgvBikeOrder from '../models/KgvBikeOrder.js';
import User from '../models/User.js';
import { sendKgvOrderEmail } from '../util/nodemailer.js';

export const createKgvBikeOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      idProof,
      idNumber,
      country,
      state,
      city,
      color,
    } = req.body;

    // Validation
    if (
      !name || !phone || !email || !idProof || !idNumber ||
      !country || !state || !city || !color
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Save Order
    const order = await KgvBikeOrder.create({
      name,
      phone,
      email,
      idProof,
      idNumber,
      country,
      state,
      city,
      branch: city, // defaulting to city
      color,
    });

    // Find dealer (for branch/city)
    const dealer = await User.findOne({ role: "dealer", branch: city });
    const dealerEmail = dealer?.email || null;

    // Send Email Notification
    await sendKgvOrderEmail({
      name,
      phone,
      email,
      dealerEmail,
      color,
      city,
    });

    res.status(200).json({ success: true, message: "Order placed successfully", order });

  } catch (error) {
    console.error("❌ Error placing KGV order:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
