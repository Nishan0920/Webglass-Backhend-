import mongoose from "mongoose";

// =====================================================
// SALE ITEM SCHEMA
// =====================================================

const saleItemSchema =
  new mongoose.Schema(
    {
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      details: {
        type: String,
        default: "",
      },

      qty: {
        type: Number,
        required: true,
        min: 1,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

// =====================================================
// SALE SCHEMA
// =====================================================

const saleSchema =
  new mongoose.Schema(
    {
      InvoiceNumber: {
        type: String,
        required: true,
        unique: true,
      },

      Customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },

      Items: {
        type: [saleItemSchema],

        required: true,

        validate: {
          validator: (value) =>
            Array.isArray(value) &&
            value.length > 0,

          message:
            "At least one sale item is required",
        },
      },

      SubTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      Discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      Tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      RoundOff: {
        type: Number,
        default: 0,
      },

      Total: {
        type: Number,
        required: true,
        min: 0,
      },

      PaidBy: {
        type: String,

        enum: [
          "Cash",
          "QR",
          "Due",
        ],

        default: "Cash",
      },

      AmountPaid: {
        type: Number,
        default: 0,
        min: 0,
      },

      AmountDue: {
        type: Number,
        default: 0,
        min: 0,
      },

      Note: {
        type: String,
        default: "",
      },
    },

    {
      timestamps: true,
    }
  );

// =====================================================
// MODEL
// =====================================================

const Sale =
  mongoose.model(
    "Sale",
    saleSchema
  );

export default Sale;