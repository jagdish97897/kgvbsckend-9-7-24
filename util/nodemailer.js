import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.EMAIL_PORT),// ✅ no need to parse
  secure: true, // ✅ because 465 is a secure port
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
  connectionTimeout: 10000,
});

export async function sendKgvOrderEmail({
  name,
  phone,
  email,
  dealerEmail,
  color,
  city,
}) {
  const [firstname, ...rest] = name.split(" ");
  const lastname = rest.join(" ");

  const customerMailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "✅ KGV Hybrid Bike Order Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Your KGV Bike Order is Confirmed</h2>
        <p>Dear ${firstname},</p>
        <p>Thank you for ordering a KGV Hybrid Bike.</p>

        <h3>Order Details:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Color:</strong> ${color}</p>
        <p><strong>Branch:</strong> ${city}</p>

        <p>Our dealer will contact you shortly. For queries, email <a href="mailto:team@kgvl.co.in">team@kgvl.co.in</a>.</p>
      </div>
    `,
  };

  const dealerMailOptions = {
    from: process.env.SENDER_EMAIL,
    to: dealerEmail,
    subject: "📦 New KGV Hybrid Bike Order",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2196F3;">New Order Alert</h2>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Color Chosen:</strong> ${color}</p>
        <p><strong>Branch:</strong> ${city}</p>

        <p>Please follow up with the customer to arrange delivery.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    console.log("✅ Customer email sent");

    if (dealerEmail) {
      await transporter.sendMail(dealerMailOptions);
      console.log("✅ Dealer email sent");
    } else {
      console.warn("⚠️ Dealer email missing. Notification skipped.");
    }
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

export function sendEmailNotification({
  name,
  phone,
  email, // Customer email
  razorpay_order_id,
  razorpay_payment_id,
  dealerEmail, // NEW: Dealer email
}) {
  const [firstname, ...rest] = name.split(" ");
  const lastname = rest.join(" ");
  const phonenumber = phone;

  const customerMailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "✅ Payment Successful – KGV Hybrid Solution",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Payment Confirmation</h2>
        <p>Dear ${firstname},</p>
        <p>Thank you for your payment. Here are your details:</p>

        <h3>Customer Info</h3>
        <p><strong>Name:</strong> ${firstname} ${lastname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phonenumber}</p>

        <h3>Transaction Info</h3>
        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

        <p>For any queries, reach out at <a href="mailto:team@kgvl.co.in">team@kgvl.co.in</a>.</p>
        <p style="font-size: 12px; color: #aaa;">&copy; 2024 KGVL. All rights reserved.</p>
      </div>
    `,
  };

  const dealerMailOptions = {
    from: process.env.SENDER_EMAIL,
    to: dealerEmail,
    subject: "📦 New Order Received – KGV Hybrid Solution",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2196F3;">New Customer Order</h2>
        <p><strong>Customer Name:</strong> ${firstname} ${lastname}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Customer Phone:</strong> ${phonenumber}</p>

        <h3>Transaction Info</h3>
        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

        <p>Please prepare to fulfill this order at your branch.</p>
        <p style="font-size: 12px; color: #aaa;">&copy; 2024 KGVL. All rights reserved.</p>
      </div>
    `,
  };

  // Send customer mail
  transporter.sendMail(customerMailOptions, (error, info) => {
    if (error) {
      console.error("❌ Customer Email Error:", error);
    } else {
      console.log("📧 Customer Email Sent:", info.response);
    }
  });

  // Send dealer mail
  transporter.sendMail(dealerMailOptions, (error, info) => {
    if (error) {
      console.error("❌ Dealer Email Error:", error);
    } else {
      console.log("📦 Dealer Email Sent:", info.response);
    }
  });
}

// export function sendEmailNotification({ name, phone, email, razorpay_order_id, razorpay_payment_id }) {
//   const [firstname, ...rest] = name.split(" ");
//   const lastname = rest.join(" ");
//   const phonenumber = phone;

//   const mailOptions = {
//     from: process.env.SENDER_EMAIL,
//     to: email,
//     subject: "✅ Payment Successful – KGV Hybrid Solution",
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <h2 style="color: #4CAF50;">Payment Confirmation</h2>
//         <p>Dear ${firstname},</p>
//         <p>Thank you for your payment. Here are your details:</p>

//         <h3>Customer Info</h3>
//         <p><strong>Name:</strong> ${firstname} ${lastname}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phonenumber}</p>

//         <h3>Transaction Info</h3>
//         <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
//         <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

//         <p>For any queries, reach out at <a href="mailto:team@kgvl.co.in">team@kgvl.co.in</a>.</p>

//         <p style="font-size: 12px; color: #aaa;">&copy; 2024 KGVL. All rights reserved.</p>
//       </div>
//     `,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("📧 Email Error:", error);
//     } else {
//       console.log("📨 Email Sent:", info.response);
//     }
//   });
// }


// import nodemailer from "nodemailer";
// import { config } from "dotenv";

// // Load environment variables
// config({ path: "./config/config.env" });

// // Single transporter instance reused in the app
// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT) || 465,
//   secure: process.env.SMTP_PORT === "465",
//   auth: {
//     user: process.env.SENDER_EMAIL,
//     pass: process.env.SENDER_EMAIL_PASSWORD,
//   },
//   connectionTimeout: 10000, // 10 seconds
// });

// export function sendEmailNotification({
//   name,
//   phone,
//   email,
//   razorpay_order_id,
//   razorpay_payment_id,
// }) {
//   const [firstname, ...rest] = name.split(" ");
//   const lastname = rest.join(" ");
//   const phonenumber = phone;

//   const mailOptions = {
//     from: process.env.SENDER_EMAIL,
//     to: email,
//     subject: "✅ Payment Successful – KGV Hybrid Solution",
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <h2 style="color: #4CAF50;">Payment Confirmation</h2>
//         <p>Dear ${firstname},</p>
//         <p>Thank you for your payment. Here are your details:</p>

//         <h3>Customer Info</h3>
//         <p><strong>Name:</strong> ${firstname} ${lastname}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phonenumber}</p>

//         <h3>Transaction Info</h3>
//         <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
//         <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

//         <p>For any queries, reach out at <a href="mailto:team@kgvl.co.in">team@kgvl.co.in</a>.</p>

//         <p style="font-size: 12px; color: #aaa;">&copy; 2024 KGVL. All rights reserved.</p>
//       </div>
//     `,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("📧 Email Error:", error);
//     } else {
//       console.log("📨 Email Sent:", info.response);
//     }
//   });
// }
