import mongoose  from "mongoose";
 export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MONGODB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit();
  }
};


 // TWI GROUP real money
// PORT = 5000
//  MONGO_URL =mongodb+srv://parveenprajapati9310:parveen6010@cluster0.f9tjfxa.mongodb.net/;
// RAZORPAY_API_KEY= rzp_live_ls83WSMfLvMbzJ
// RAZORPAY_APT_SECRET=DK6AB0bCu5lOXPTsKFpAnpiF
// NODE_ENV = production
// host = smtpout.secureserver.net
// port = 465
// service = GoDaddy
// user = team@kgvl.co.in
// pass = Team@12345




// test razorpay
// PORT = 5000
//   MONGO_URL =mongodb+srv://parveenprajapati9310:parveen6010@cluster0.f9tjfxa.mongodb.net/;
// RAZORPAY_API_KEY= "rzp_test_QKHlS7OlJZ9Vgn"
// RAZORPAY_APT_SECRET="AX2FH1gl38cJDzkGT3uWhlqh"
// NODE_ENV = production
// host = smtpout.secureserver.net
// port = 465
// service = GoDaddy
// user = team@kgvl.co.in
// pass = Team@12345
