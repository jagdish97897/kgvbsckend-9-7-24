// contact.js
import mongoose from "mongoose";

const rentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phonenumber: {
        type: String,
        required: true,
      },
  },
  {
    timestamps: true,
  }
);

const Rent = mongoose.model("rent", rentSchema);

export { Rent };
