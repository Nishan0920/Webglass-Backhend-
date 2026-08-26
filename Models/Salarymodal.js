import mongoose from "mongoose";


const salarySchema = new mongoose.Schema(
  {
    Staff: {
      type: String,
      ref: "staffinfo",
      required: true,
    },
    Month: {
      type: String,
      required: true,
    },
    BasicSalary: {
      type: Number,
      required: true,
    },
    Allowances: {
      type: Number,
      default: 0,
    },
    Deductions: {
      type: Number,
      default: 0,
    },
    NetSalary: {
      type: Number,
      required: true,
    },
    Status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    PaymentMethod: {
      type: String,
      default: "Bank Transfer",
    },
    PayDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


salarySchema.index({ Staff: 1, Month: 1 }, { unique: true });

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;