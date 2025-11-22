import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: false,
    select: true
  },
  role: {
    type: String,
    enum: ['admin', 'subadmin', 'technician', 'user', 'dealer'],
    required: false
  },
  idproof: {
    type: String,
    required: false
  },
  idnumber: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  branch: {
    type: String,
    required: false
  },
  refralcode: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  addedBy: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = model('User', UserSchema);

export default User;