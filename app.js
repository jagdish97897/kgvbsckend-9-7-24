import express from "express";
import { config } from "dotenv";
import { Contact } from "./models/contact.js";
import { Rent } from "./models/rentkgv.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { transporter } from "./util/nodemailer.js";
import { Vistuser } from "./models/visituser.js";
import cors from "cors";


config({ path: "./config/config.env" });
export const app = express();

app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", paymentRoutes);

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

app.post("/vistuser", async (req, res) => {
  try {
    let vistuser = new Vistuser(req.body);
    let resuser = await vistuser.save();
    res.send(resuser);
  } catch (error) {
    res.send(500).send(error.message);
  }
});

app.post("/register", async (req, resp) => {
  try {
    // Save to the database
    let contact = new Contact(req.body);
    let result = await contact.save();
    console.log(req.body);

    // Send email notification

    function sendEmailNotification(formData) {
      const { email } = formData;
      const mailOptions = {
        from: "team@kgvl.co.in",
        to: email,
        subject: "New Registration",
        html: `<p>New registration details:</p>
               <p>Name: ${formData.name}</p>
               <p>Lastname: ${formData.lastname}</p>
               <p>Email: ${formData.email}</p>
               <p>Address: ${formData.address}</p>
               <p>Query: ${formData.query}</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Email error: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
    sendEmailNotification(req.body);

    resp.send(result);
    console.log("done contact")
  } catch (error) {
    resp.status(500).send(error.message);
  }
});

app.post("/rent", async (req, resp) => {
  try {
    // Save to the database
    let rent = new Rent(req.body);
    let result = await rent.save();   
    console.log(req.body);

    // Send email notification

    function sendEmailNotification(formData) {
      const { email } = formData;
      const mailOptions = {
        from: "team@kgvl.co.in",
        to: email,
        subject: "New KGV Bike for rent",
        html: `<p>New Form details:</p>
               <p>Name: ${formData.name}</p>
               <p>Lastname: ${formData.lastname}</p>
               <p>Email: ${formData.email}</p>
               <p>Address: ${formData.address}</p>
               <p>phonenumber: ${formData.phonenumber}</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Email error: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
    sendEmailNotification(req.body);

    resp.send(result);
    console.log("done contact")
  } catch (error) {
    resp.status(500).send(error.message);
  }
});



