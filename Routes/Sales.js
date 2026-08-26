import express from "express";
import mongoose from "mongoose";
import Sale from "../Models/Salesmodal.js";

const router = express.Router();

// =====================================================
// CREATE SALE
// POST /api/sale
// =====================================================
router.post("/sale", async (req, res) => {
  try {
    const {
      customerId,
      items,
      subTotal,
      discount,
      tax,
      roundOff,
      total,
      paidBy,
      amountPaid,
      amountDue,
      note,
    } = req.body;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    // ---------------------------------------------
    // CLEAN ITEMS
    // ---------------------------------------------
    const cleanItems = items.map((item) => ({
      inventoryId: item.inventoryId,
      name: item.name,
      details: item.details || "",
      qty: Number(item.qty),
      price: Number(item.price),
      discount: Number(item.discount || 0),
      amount: Number(item.amount),
    }));

    // ---------------------------------------------
    // CREATE INVOICE NUMBER
    // ---------------------------------------------
    const invoiceNumber = `INV-${Date.now()}`;

    // ---------------------------------------------
    // CREATE SALE
    // ---------------------------------------------
    const sale = await Sale.create({
      InvoiceNumber: invoiceNumber,
      Customer: customerId,
      Items: cleanItems,
      SubTotal: Number(subTotal || 0),
      Discount: Number(discount || 0),
      Tax: Number(tax || 0),
      RoundOff: Number(roundOff || 0),
      Total: Number(total || 0),
      PaidBy: paidBy || "Cash",
      AmountPaid: Number(amountPaid || 0),
      AmountDue: Number(amountDue || 0),
      Note: note || "",
    });

    // ---------------------------------------------
    // GET CREATED SALE WITH CUSTOMER
    // ---------------------------------------------
    const populatedSale = await Sale.findById(sale._id).populate(
      "Customer",
      "Name PhoneNumber Email TotalPurchases"
    );

    return res.status(201).json({
      success: true,
      message: "Sale recorded successfully",
      sale: populatedSale,
    });
  } catch (error) {
    console.error("Create sale error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to record sale",
    });
  }
});

// =====================================================
// GET ALL SALES
// GET /api/salesalldata
// =====================================================
router.get("/salesalldata", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate(
        "Customer",
        "Name PhoneNumber Email TotalPurchases"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Get sales error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get sales",
    });
  }
});

// =====================================================
// GET LATEST SALE
// GET /api/sale/latest
//
// IMPORTANT:
// This route is BEFORE /sale/:id
// =====================================================
router.get("/sale/latest", async (req, res) => {
  try {
    const sale = await Sale.findOne()
      .populate(
        "Customer",
        "Name PhoneNumber Email TotalPurchases"
      )
      .sort({
        createdAt: -1,
      });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "No sales found",
      });
    }

    return res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    console.error("Get latest sale error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get latest sale",
    });
  }
});

// =====================================================
// GET SINGLE SALE
// GET /api/sale/:id
// =====================================================
router.get("/sale/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    const sale = await Sale.findById(id).populate(
      "Customer",
      "Name PhoneNumber Email TotalPurchases"
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    console.error("Get sale error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get sale",
    });
  }
});

// =====================================================
// DELETE SALE
// DELETE /api/sale/:id
// =====================================================
router.delete("/sale/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ---------------------------------------------
    // VALIDATE SALE ID
    // ---------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    // ---------------------------------------------
    // FIND SALE
    // ---------------------------------------------
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // ---------------------------------------------
    // DELETE SALE
    // ---------------------------------------------
    await Sale.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      sale,
    });
  } catch (error) {
    console.error("Delete sale error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete sale",
    });
  }
});

export default router;