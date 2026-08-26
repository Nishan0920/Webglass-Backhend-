import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import Items from "../Models/InventoryModal.js";

const router = express.Router();

// ==========================================
// MULTER IMAGE UPLOAD SETUP
// ==========================================

// Vercel allows temporary files inside /tmp
const uploadDir = "/tmp/uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jfif",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".jfif",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedTypes.includes(file.mimetype) ||
    allowedExtensions.includes(extension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and JFIF images are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ==========================================
// CREATE PRODUCT
// ==========================================

router.post(
  "/inventory",
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        ProductName,
        Category,
        Brand,
        CostPrice,
        SellingPrice,
        Stock,
      } = req.body;

      if (
        !ProductName ||
        !Category ||
        !Brand ||
        !CostPrice ||
        !SellingPrice
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill all required fields",
        });
      }

      const stockValue = Number(Stock);

      const product = await Items.create({
        ProductName,
        Category,
        Brand,
        CostPrice,
        SellingPrice,
        Stock:
          Number.isFinite(stockValue) && stockValue >= 0
            ? stockValue
            : 0,

        // Save filename for now
        Image: req.file ? req.file.filename : "",
      });

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        data: product,
      });
    } catch (error) {
      console.error("Create inventory error:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ==========================================
// GET ALL PRODUCTS
// ==========================================

router.get("/inventoryalldata", async (req, res) => {
  try {
    const items = await Items.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "All inventory data",
      data: items,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

router.get("/inventory/:id", async (req, res) => {
  try {
    const item = await Items.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product found",
      data: item,
    });
  } catch (error) {
    console.error("Get single inventory error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// UPDATE PRODUCT
// ==========================================

router.put(
  "/inventory/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        ProductName,
        Category,
        Brand,
        CostPrice,
        SellingPrice,
        Stock,
      } = req.body;

      const existingProduct = await Items.findById(
        req.params.id
      );

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const updateData = {
        ProductName,
        Category,
        Brand,
        CostPrice,
        SellingPrice,
      };

      // ==========================================
      // UPDATE STOCK
      // ==========================================

      if (
        Stock !== undefined &&
        Stock !== null &&
        Stock !== ""
      ) {
        const stockValue = Number(Stock);

        if (
          !Number.isFinite(stockValue) ||
          stockValue < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Stock must be a valid number of 0 or more",
          });
        }

        updateData.Stock = stockValue;
      }

      // ==========================================
      // UPDATE IMAGE
      // ==========================================

      if (req.file) {
        updateData.Image = req.file.filename;

        // Delete old temporary image
        if (existingProduct.Image) {
          const oldImagePath = path.join(
            uploadDir,
            existingProduct.Image
          );

          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const updatedProduct =
        await Items.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Update inventory error:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ==========================================
// ADJUST STOCK
// ==========================================

router.patch(
  "/inventory/:id/adjust-stock",
  async (req, res) => {
    try {
      const { amount } = req.body;

      const change = Number(amount);

      if (
        !Number.isFinite(change) ||
        change === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A non-zero numeric amount is required",
        });
      }

      const existingProduct = await Items.findById(
        req.params.id
      );

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const currentStock = Number(
        existingProduct.Stock || 0
      );

      const resultingStock = currentStock + change;

      if (resultingStock < 0) {
        return res.status(409).json({
          success: false,
          message:
            `Not enough stock. Available: ${currentStock}, requested change: ${change}`,
        });
      }

      const updatedProduct =
        await Items.findByIdAndUpdate(
          req.params.id,
          {
            $inc: {
              Stock: change,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      res.status(200).json({
        success: true,
        message: "Stock updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Adjust stock error:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ==========================================
// DELETE PRODUCT
// ==========================================

router.delete(
  "/inventory/:id",
  async (req, res) => {
    try {
      const item = await Items.findById(
        req.params.id
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Delete image from temporary uploads
      if (item.Image) {
        const imagePath = path.join(
          uploadDir,
          item.Image
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Items.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete inventory error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;