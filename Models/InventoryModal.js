import mongoose from "mongoose";

const InventoryItems = new mongoose.Schema(
  {
    ProductName: {
      type: String,
      required: true,
      trim: true,
    },

    Category: {
      type: String,
      required: true,
      trim: true,
    },

    Brand: {
      type: String,
      required: true,
      trim: true,
    },

    // What you paid to acquire/produce the item.
    CostPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    SellingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Current quantity on hand. This is what SalesPOS reads to block
    // out-of-stock sales, and decrements when a sale is completed.
    Stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Image is stored directly in Mongo (Vercel's filesystem is ephemeral,
    // so files saved to disk don't survive between requests).
    ImageData: {
      type: Buffer,
      default: null,
    },

    ImageContentType: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Items = mongoose.model("Inventory", InventoryItems);

export default Items;
