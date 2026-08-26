import mongoose from "mongoose";
const rentPaymentSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },

    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paidDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Due",
        "Cash",
        "Bank Transfer",
        "QR",
      ],
      default: "Due",
    },

    status: {
      type: String,
      enum: ["Due", "Paid", "Overdue"],
      default: "Due",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
const Rent = mongoose.model(
  "RentPayment",
  rentPaymentSchema
);
export default Rent