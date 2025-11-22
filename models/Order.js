import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  idProof: { 
    type: String, 
    enum: ['Aadhar', 'PAN', 'Driving License', 'Voter ID'], 
    required: true 
  },
  idNumber: { type: String, required: true },
  vehicleNo: { type: String, required: true },
  model: { type: String, required: true },
  bikeCC: { type: Number, required: true },
  chassisNo: { type: String, required: true },

  // Charger Info
  chargerType: {
    type: String,
    enum: ['5AMP', '15AMP'],
    default: null,
  },

  // Battery Info
  batteryType: {
    type: String,
    default: null,
  },
  batteryCapacity: {
    type: String,
    enum: ['72v 12A/H', '72v 15A/H'],
    default: null,
  },

  // Location Info
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  branch: { type: String, required: true },
  
  // Price Fields
  totalAmount: { type: Number, default: 0 },
  payableAmount: { type: Number, default: 0 },
  kitName: { type: String, default: "N/A" },

  // Razorpay Info
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },

  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },

  timestamp: { type: Date, default: Date.now },
});

// Corrected pre-save hook
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    let baseAmount = 0;

    // Kit pricing based on bikeCC
    const cc = this.bikeCC;
    if (cc >= 100 && cc <= 125) {
      baseAmount = 39000;
      this.kitName = "HX2";
    } else if (cc > 125 && cc <= 190) {
      baseAmount = 45000;
      this.kitName = "HX3";
    } else {
      baseAmount = 0;
      this.kitName = "N/A";
    }

    // Charger price
    let chargerPrice = 0;
    if (this.chargerType === "5AMP") {
      chargerPrice = 1200;
    } else if (this.chargerType === "15AMP") {
      chargerPrice = 2000;
    }

    // Battery price based on capacity (2 pieces)
    let batteryPrice = 0;
    if (this.batteryCapacity === "72v 12A/H") {
      batteryPrice = 20000;
    } else if (this.batteryCapacity === "72v 15A/H") {
      batteryPrice = 28000;
    }

    // Final total
    this.totalAmount = baseAmount + chargerPrice + batteryPrice;

    // Payable amount (5% of total)
    this.payableAmount = Math.round(this.totalAmount * 0.05);
  }

  next();
});

export default mongoose.model("Order", orderSchema);



// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   phone: { type: String, required: true, index: true },
//   email: { type: String, required: true, index: true },
//   idProof: { 
//     type: String, 
//     enum: ['Aadhar', 'PAN', 'Driving License', 'Voter ID'], 
//     required: true 
//   },
//   idNumber: { type: String, required: true },
//   vehicleNo: { type: String, required: true },
//   model: { type: String, required: true },
//   bikeCC: { type: Number, required: true },
//   chassisNo: { type: String, required: true },

//   // Charger Info
//   chargerType: {
//     type: String,
//     enum: ['5AMP', '15AMP'],
//     default: null,
//   },

//   // Battery Info
//   batteryType: {
//     type: String,
//     enum: ['72v 12A/H', '72v 15A/H'],
//     default: null,
//   },

//   // Price Fields
//   totalAmount: { type: Number, default: 0 },
//   payableAmount: { type: Number, default: 0 },
//   kitName: { type: String, default: "N/A" },

//   // Razorpay Info
//   razorpay_order_id: { type: String },
//   razorpay_payment_id: { type: String },
//   razorpay_signature: { type: String },

//   status: { 
//     type: String, 
//     enum: ['Pending', 'Completed', 'Failed'], 
//     default: 'Pending' 
//   },

//   timestamp: { type: Date, default: Date.now },
// });

// orderSchema.pre("save", function (next) {
//   if (this.isNew) {
//     let baseAmount = 0;

//     // Kit pricing based on bikeCC
//     const cc = this.bikeCC;
//     if (cc >= 100 && cc <= 125) {
//       baseAmount = 39000;
//       this.kitName = "HX2";
//     } else if (cc > 125 && cc <= 150) {
//       baseAmount = 45000;
//       this.kitName = "HX3";
//     } else {
//       baseAmount = 0;
//       this.kitName = "N/A";
//     }

//     // Charger price
//     let chargerPrice = 0;
//     if (this.chargerType === "5AMP") {
//       chargerPrice = 1200;
//     } else if (this.chargerType === "15AMP") {
//       chargerPrice = 2000;
//     }

//     // Battery price (both are 2 pieces)
//     let batteryPrice = 0;
//     if (this.batteryType === "72v 12A/H") {
//       batteryPrice = 10000 * 2;
//     } else if (this.batteryType === "72v 15A/H") {
//       batteryPrice = 14000 * 2;
//     }

//     // Final total
//     this.totalAmount = baseAmount + chargerPrice + batteryPrice;

//     // Payable amount (5% of total)
//     this.payableAmount = this.totalAmount * 0.05;
//   }

//   next();
// });

// export default mongoose.model("Order", orderSchema);


// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   phone: { type: String, required: true, index: true },
//   email: { type: String, required: true, index: true },
//   idProof: { 
//     type: String, 
//     enum: ['Aadhar', 'PAN', 'Driving License', 'Voter ID'], 
//     required: true 
//   },
//   idNumber: { type: String, required: true },
//   vehicleNo: { type: String, required: true },
//   model: { type: String, required: true },
//   bikeCC: { type: Number, required: true }, // changed to Number
//   chassisNo: { type: String, required: true },
  
//   totalAmount: { type: Number, default: 0 },
//   payableAmount: { type: Number, default: 0 },
//   kitName: { type: String, default: "N/A" },

//   razorpay_order_id: { type: String },
//   razorpay_payment_id: { type: String },
//   razorpay_signature: { type: String },

//   status: { 
//     type: String, 
//     enum: ['Pending', 'Completed', 'Failed'], 
//     default: 'Pending' 
//   },

//   timestamp: { type: Date, default: Date.now },
// });

// // Pre-save middleware (only on document creation)
// paymentSchema.pre("save", function (next) {
//   if (this.isNew) {
//     const cc = this.bikeCC;

//     if (cc >= 100 && cc <= 125) {
//       this.totalAmount = 39000;
//       this.kitName = "HX2";
//     } else if (cc > 125 && cc <= 150) {
//       this.totalAmount = 45000;
//       this.kitName = "HX3";
//     } else {
//       this.totalAmount = 0;
//       this.kitName = "N/A";
//     }

//     this.payableAmount = this.totalAmount * 0.05;
//   }

//   next();
// });

// export default mongoose.model("Payment", paymentSchema);






// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   email: String,
//   idProof: String,
//   idNumber: String,
//   vehicleNo: String,
//   model: String,
//   bikeCC: String, // e.g., "100", "125", "150"
//   chassisNo: String,
//   totalAmount: Number,
//   payableAmount: Number,
//   kitName: String, // <-- Added field for kit name
//   razorpay_order_id: String,
//   razorpay_payment_id: String,
//   razorpay_signature: String,
//   timestamp: { type: Date, default: Date.now },
// });

// // Pre-save middleware to set totalAmount, payableAmount, and kitName
// paymentSchema.pre("save", function (next) {
//   const cc = parseInt(this.bikeCC);

//   if (cc >= 100 && cc <= 125) {
//     this.totalAmount = 39000;
//     this.kitName = "HX2";
//   } else if (cc > 125 && cc <= 150) {
//     this.totalAmount = 45000;
//     this.kitName = "HX3";
//   } else {
//     this.totalAmount = 0;
//     this.kitName = "N/A";
//   }

//   this.payableAmount = this.totalAmount * 0.05;
//   next();
// });

// export default mongoose.model("Payment", paymentSchema);


// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   email: String,
//   idProof: String,
//   idNumber: String,
//   vehicleNo: String,
//   model: String,
//   bikeCC: String, // e.g., "100", "125", "150"
//   chassisNo: String,
//   totalAmount: Number,
//   payableAmount: Number,
//   razorpay_order_id: String,
//   razorpay_payment_id: String,
//   razorpay_signature: String,
//   timestamp: { type: Date, default: Date.now },
// });

// // Pre-save middleware to set totalAmount and payableAmount
// paymentSchema.pre("save", function (next) {
//   const cc = parseInt(this.bikeCC);

//   if (cc >= 100 && cc <= 125) {
//     this.totalAmount = 39000;
//   } else if (cc > 125 && cc <= 150) {
//     this.totalAmount = 45000;
//   } else {
//     this.totalAmount = 0; // Default/fallback if value doesn't match
//   }

//   this.payableAmount = this.totalAmount * 0.05;
//   next();
// });

// export default mongoose.model("Payment", paymentSchema);


// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   email: String,
//   idProof: String,         // e.g., Aadhar, PAN, DL
//   idNumber: String,        // actual number of the ID
//   vehicleNo: String,       // vehicle number
//   model: String,           // bike model
//   bikeCC: String,          // bike engine capacity
//   chassisNo: String,       // chassis number
//   totalAmount: Number,     // total price of the product/service
//   payableAmount: Number,   // 5% of totalAmount
//   razorpay_order_id: String,
//   razorpay_payment_id: String,
//   razorpay_signature: String,
//   timestamp: { type: Date, default: Date.now },
// });

// export default mongoose.model("Payment", paymentSchema);

// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   amount: Number,
//   razorpay_order_id: String,
//   razorpay_payment_id: String,
//   razorpay_signature: String,
//   timestamp: { type: Date, default: Date.now },
// });

// export default mongoose.model("Payment", paymentSchema);