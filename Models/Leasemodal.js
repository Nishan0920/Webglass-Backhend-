import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    property: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    propertyOwner: {
      type: String,
      required: true,
      trim: true,
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },

    agreementStartDate: {
      type: Date,
      required: true,
    },

    agreementEndDate: {
      type: Date,
      required: true,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    noticePeriod: {
      type: String,
      default: "",
      trim: true,
    },

    rentIncrement: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);
const Lease = mongoose.model("Lease", leaseSchema);

export default Lease;