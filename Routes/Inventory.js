import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import Inventory from "../Models/InventoryModal.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/inventoryalldata", async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
});

router.get("/inventory/image/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item || !item.ImageData) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", item.ImageContentType || "image/jpeg");
    res.send(item.ImageData);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Failed to fetch image");
  }
});

router.post("/inventory", upload.single("image"), async (req, res) => {
  try {
    const { ProductName, Category, Brand, CostPrice, SellingPrice, Stock } =
      req.body;

    const newItem = new Inventory({
      ProductName,
      Category,
      Brand,
      CostPrice: Number(CostPrice) || 0,
      SellingPrice: Number(SellingPrice) || 0,
      Stock: Number(Stock) || 0,
    });

    if (req.file) {
      newItem.ImageData = req.file.buffer;
      newItem.ImageContentType = req.file.mimetype;
    }

    await newItem.save();

    res.status(200).json({
      success: true,
      message: "Product added successfully",
      data: newItem,
    });
  } catch (error) {
    console.error("Error adding product:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to add product",
    });
  }
});

router.patch("/inventory/:id/adjust-stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const adjustBy = Number(amount);

    if (!Number.isFinite(adjustBy)) {
      return res.status(400).json({
        success: false,
        message: "amount must be a valid number",
      });
    }

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const currentStock = Number(item.Stock || 0);
    const newStock = currentStock + adjustBy;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot adjust stock below 0. Current stock: ${currentStock}`,
      });
    }

    item.Stock = newStock;
    await item.save();

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: item,
    });
  } catch (error) {
    console.error("Error adjusting stock:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to adjust stock",
    });
  }
});

router.put("/inventory/:id", upload.single("image"), async (req, res) => {
  try {
    const { ProductName, Category, Brand, CostPrice, SellingPrice, Stock } =
      req.body;

    const updateData = {
      ProductName,
      Category,
      Brand,
      CostPrice: Number(CostPrice) || 0,
      SellingPrice: Number(SellingPrice) || 0,
      Stock: Number(Stock) || 0,
    };

    if (req.file) {
      updateData.ImageData = req.file.buffer;
      updateData.ImageContentType = req.file.mimetype;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
});

router.delete("/inventory/:id", async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
});

export default router;