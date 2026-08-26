import mongoose from "mongoose";

const expensesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    vendor: {
      type: String,
      trim: true,
      default: "",
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    isBill: {
      type: Boolean,
      default: false,
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Expenses = mongoose.model("Expenses", expensesSchema);

export default Expenses;