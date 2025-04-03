import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/paymentModel.js"; // Adjust the path accordingly
import Razorpay from "razorpay";
import { Vistuser } from "../models/visituser.js";
import { transporter } from "../util/nodemailer.js";


export const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
    // note_key: "email sent succefully to TWCPL"

  };
  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
};

async function deleteVistuserByEmail(email) {
  try {
    // Logic to delete user with the given email from Vistuser
    await Vistuser.findOneAndDelete({ email: email }).exec();
    console.log(`User with email ${email} deleted from Vistuser.`);
  } catch (error) {
    console.error(`Error deleting user: ${error}`);
  }
}



export const paymentVerification = async (req, res) => {

  // try {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");


  // console.log("sig received ", razorpay_signature);
  // console.log("sig generated ", expectedSignature);
  const isAuthentic = razorpay_signature === expectedSignature;
  //  const isAuthentic = razorpay_order_id === razorpay_payment_id;

  // console.log("payment done now checking");


  var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY2, key_secret: process.env.RAZORPAY_API_SECRET2 })
  var response = await instance.payments.fetch(razorpay_payment_id);

  // console.log(response);

  // console.log(response.notes.firstname);

  if (isAuthentic) {
    const firstname = response.notes.firstname;
    const lastname = response.notes.lastname;
    const email = response.notes.email;
    const address = response.notes.address;
    const phonenumber = response.notes.phonenumber;

    // Database comes here
    await Payment.create({
      firstname,
      lastname,
      email,
      address,
      phonenumber,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });





    function sendEmailNotification1() {
      const mailOptions = {
        from: "team@kgvl.co.in",
        to: "sales@kgvl.co.in",
        subject: "Customer booking Detail",
        html: `<p>New registration details:</p>
                      <p>Name: ${firstname}</p>
                       <p>Lastname: ${lastname}</p>
                       <p>Email: ${email}</p>
                       <p>Address: ${address}</p>
                       <p>Phone No.: ${phonenumber}</p>
                       <p>razorpay_order_id: ${razorpay_order_id}</p>
                      <p>razorpay_payment_id: ${razorpay_payment_id}</p>`,
      };


      const mailOptions1 = {
        from: "team@kgvl.co.in",
        to: email,
        subject: "Customer booking Detail",
        html: `<p>New registration details:</p>
                        <p>Name: ${firstname}</p>
                         <p>Lastname: ${lastname}</p>
                         <p>Email: ${email}</p>
                         <p>Address: ${address}</p>
                         <p>Phone No.: ${phonenumber}</p>
                         <p>razorpay_order_id: ${razorpay_order_id}</p>
                        <p>razorpay_payment_id: ${razorpay_payment_id}</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Email error: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      transporter.sendMail(mailOptions1, function (error, info) {
        if (error) {
          console.log("Email error: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    function sendEmailNotification() {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: `${email}`,
        subject: "Payment Successful for KGV Hybrid solution",
        html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #4CAF50;">KGV Hybrid solution Payment Confirmation</h2>
                  <p>Dear ${firstname},</p>

                  <p>Thank you for choosing KGV Hybrid solution! We are pleased to confirm that your payment has been successfully processed. Below are the details of your transaction:</p>

                  <h3 style="color: #333;">KGV Hybrid solution Payment Details</h3>
                  <p><strong>Full Name:</strong> ${firstname} ${lastname}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone No.:</strong> ${phonenumber}</p>

                  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

                  <h3 style="color: #333;">Payment Information</h3>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

                  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

                  <p>Your contest participation is now confirmed. If you have any questions or need assistance, please don't hesitate to reach out to our support team at <a href="mailto:team@kgvl.co.in" style="color: #4CAF50;">team@kgvl.co.in</a>.</p>

                  <p>Thank you for choosing KGVL. We look forward to serving you!</p>

                  <p style="color: #999; font-size: 12px;">&copy; 2024 KGVL. All rights reserved.</p>
              </div>
          `,
      };


      // const mailOptions1 = {
      //   from: "team@kgvl.co.in",
      //   to: "sales@kgvl.co.in",
      //   subject: "New Customer Booking Detail",
      //   html: `
      //         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      //             <h2 style="color: #FF5722;">New Customer Booking</h2>
      //             <p>A new customer has just completed a booking. Below are the details:</p>

      //             <h3 style="color: #333;">Customer Information</h3>
      //             <p><strong>Full Name:</strong> ${notes.name}</p>
      //             <p><strong>Email:</strong> ${notes.email}</p>
      //             <p><strong>Phone No.:</strong> ${notes.phone}</p>

      //             <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

      //             <h3 style="color: #333;">Transaction Details</h3>
      //             <p><strong>Razorpay Order ID:</strong> ${razorpay_order_id}</p>
      //             <p><strong>Razorpay Payment ID:</strong> ${razorpay_payment_id}</p>

      //             <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

      //             <p style="color: #555;">Please process this order as soon as possible and update the relevant records.</p>

      //             <p style="color: #999; font-size: 12px;">&copy; 2024 KGVL. All rights reserved.</p>
      //         </div>
      //     `,
      // };


      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("User Email error: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      // transporter.sendMail(mailOptions1, function (error, info) {
      //   if (error) {
      //     console.log("Team Email error: " + error);
      //   } else {
      //     console.log("Email sent: " + info.response);
      //   }
      // });
    }

    sendEmailNotification();

    await deleteVistuserByEmail(email);
    res.redirect(
      `https://benevolent-queijadas-f11d8c.netlify.app/paymentsuccess?reference=${razorpay_payment_id}`);



  } else {

    // function sendEmailNotification2() {
    //   const transporter = nodemailer.createTransport({
    //     host: "smtpout.secureserver.net",
    //     secure: false,
    //     port: 465,
    //     service: " GoDaddy",
    //     auth: {
    //       user: "team@kgvl.co.in", // Update with your Gmail address
    //       pass: "Team@12345", // Update with your Gmail password
    //     },
    //   });

    //   const mailOptions = {
    //     from: "team@kgvl.co.in",
    //     to: email,
    //     subject: "Customer booking Detail",
    //     html: `<p>New registration details:</p>
    //                          <p>payment failed</p>
    //                          <p>again try</p>`,
    //   };

    //   transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //       console.log("Email error: " + error);
    //     } else {
    //       console.log("Email sent: " + info.response);
    //     }
    //   });

    // }

    function sendEmailNotification() {

      const mailOptions = {
        from: "team@kgvl.co.in",
        to: `${email}`,
        subject: "Customer booking Detail",
        html: `<p>New enquery details:</p>
                             <p>Payment failed</p>
                             <p>Try again </p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Email error: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

    }

    sendEmailNotification();
    res.status(400).json({ success: false, });
  }


};
