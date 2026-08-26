import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },

    Email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    PhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    Address: {
      type: String,
      required: true,
      trim: true,
    },

    LastVisit: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Data = mongoose.model(
  "Customer",
  customerSchema
);

export default Data;