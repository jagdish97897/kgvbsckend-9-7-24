import mongoose from "mongoose";

const kgvBikeOrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  idProof: { 
    type: String, 
    enum: ['Aadhar', 'PAN', 'Driving License', 'Voter ID'], 
    required: true 
  },
  idNumber: { type: String, required: true },
  // Location Info
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  branch: { type: String, required: true },
  color: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },

  timestamp: { type: Date, default: Date.now },
});


export default mongoose.model("KgvBikeOrder", kgvBikeOrderSchema);
