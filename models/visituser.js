import mongoose from "mongoose";

const vistuserSchema = new mongoose.Schema(
  {
    firstname: {
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

const Vistuser = mongoose.model("vistuser", vistuserSchema);

export  {Vistuser};
