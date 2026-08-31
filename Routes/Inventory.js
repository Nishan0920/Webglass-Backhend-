import express from "express";
import multer from "multer";
import Inventory from "../Models/InventoryModal.js";

const router = express.Router();

// Store the uploaded file in memory (not on disk) — Vercel's filesystem
// is ephemeral, so anything written to disk disappears between requests.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, matches frontend check
});

// GET all inventory items
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

// GET a single product's image, served directly as binary
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

// CREATE a new product
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

// UPDATE an existing product
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

// DELETE a product
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