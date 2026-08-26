import express from "express";
import mongoose from "mongoose";

import Lease from "../Models/Leasemodal.js";
import Rent from "../Models/RentPaymentmodal.js";

const router = express.Router();

const withComputedStatus = (paymentDoc) => {
  const payment = paymentDoc.toObject ? paymentDoc.toObject() : paymentDoc;

  if (
    payment.status === "Due" &&
    payment.dueDate &&
    new Date(payment.dueDate) < new Date()
  ) {
    return {
      ...payment,
      status: "Overdue",
    };
  }

  return payment;
};

router.post("/", async (req, res) => {
  try {
    const {
      property,
      location,
      propertyOwner,
      monthlyRent,
      agreementStartDate,
      agreementEndDate,
      securityDeposit,
      advancePaid,
      noticePeriod,
      rentIncrement,
      notes,
    } = req.body;

    const lease = await Lease.create({
      property,
      location,
      propertyOwner,
      monthlyRent,
      agreementStartDate,
      agreementEndDate,
      securityDeposit,
      advancePaid,
      noticePeriod,
      rentIncrement,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Lease created successfully",
      data: lease,
    });
  } catch (error) {
    console.error("Create lease error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create lease",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const leases = await Lease.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: leases,
    });
  } catch (error) {
    console.error("Get leases error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leases",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE LEASE
// PUT /rentandlease/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lease ID",
      });
    }

    const {
      property,
      location,
      propertyOwner,
      monthlyRent,
      agreementStartDate,
      agreementEndDate,
      securityDeposit,
      advancePaid,
      noticePeriod,
      rentIncrement,
      notes,
    } = req.body;

    const updateData = {};

    if (property !== undefined) updateData.property = property;

    if (location !== undefined) updateData.location = location;

    if (propertyOwner !== undefined) updateData.propertyOwner = propertyOwner;

    if (monthlyRent !== undefined) updateData.monthlyRent = monthlyRent;

    if (agreementStartDate !== undefined)
      updateData.agreementStartDate = agreementStartDate;

    if (agreementEndDate !== undefined)
      updateData.agreementEndDate = agreementEndDate;

    if (securityDeposit !== undefined)
      updateData.securityDeposit = securityDeposit;

    if (advancePaid !== undefined) updateData.advancePaid = advancePaid;

    if (noticePeriod !== undefined) updateData.noticePeriod = noticePeriod;

    if (rentIncrement !== undefined) updateData.rentIncrement = rentIncrement;

    if (notes !== undefined) updateData.notes = notes;

    const lease = await Lease.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lease updated successfully",
      data: lease,
    });
  } catch (error) {
    console.error("Update lease error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update lease",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE LEASE + PAYMENT HISTORY
// DELETE /rentandlease/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lease ID",
      });
    }

    const lease = await Lease.findByIdAndDelete(id);

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    await Rent.deleteMany({
      leaseId: id,
    });

    return res.status(200).json({
      success: true,
      message: "Lease and rent payment history deleted successfully",
    });
  } catch (error) {
    console.error("Delete lease error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete lease",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE RENT PAYMENT
// POST /rentandlease/payment
// =====================================================

router.post("/payment", async (req, res) => {
  try {
    const {
      leaseId,
      rentAmount,
      dueDate,
      paidDate,
      paymentMethod,
      status,
      notes,
    } = req.body;

    // Validate lease ID
    if (!leaseId) {
      return res.status(400).json({
        success: false,
        message: "Lease ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(leaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lease ID",
      });
    }

    // Make sure lease exists
    const lease = await Lease.findById(leaseId);

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: "Lease not found",
      });
    }

    // Validate status
    const validStatuses = ["Due", "Paid", "Overdue"];

    const finalStatus = validStatuses.includes(status) ? status : "Due";

    // If Paid, paidDate should exist
    const finalPaidDate =
      finalStatus === "Paid" ? paidDate || new Date() : null;

    const rentPayment = await Rent.create({
      leaseId,
      rentAmount,
      dueDate,
      paidDate: finalPaidDate,
      paymentMethod: paymentMethod || "Due",
      status: finalStatus,
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Rent payment created successfully",
      data: withComputedStatus(rentPayment),
    });
  } catch (error) {
    console.error("Create rent payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create rent payment",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE / MARK PAYMENT
// PUT /rentandlease/payment/:id
// =====================================================

router.put("/payment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const { rentAmount, dueDate, paidDate, paymentMethod, status, notes } =
      req.body;

    const updateData = {};

    if (rentAmount !== undefined) {
      updateData.rentAmount = rentAmount;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate;
    }

    if (paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // ==========================================
    // STATUS HANDLING
    // ==========================================

    if (status !== undefined) {
      const validStatuses = ["Due", "Paid", "Overdue"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      updateData.status = status;

      // If payment is Paid,
      // make sure it has a paid date.
      if (status === "Paid") {
        updateData.paidDate = paidDate || new Date();
      }

      // If payment becomes Due/Overdue,
      // remove paid date.
      if (status === "Due" || status === "Overdue") {
        updateData.paidDate = null;
      }
    } else if (paidDate !== undefined) {
      updateData.paidDate = paidDate;
    }

    const payment = await Rent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("leaseId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Rent payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rent payment updated successfully",
      data: withComputedStatus(payment),
    });
  } catch (error) {
    console.error("Update rent payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL PAYMENTS
// GET /rentandlease/payment
// =====================================================

router.get("/payment", async (req, res) => {
  try {
    const payments = await Rent.find().populate("leaseId").sort({
      dueDate: -1,
    });

    return res.status(200).json({
      success: true,
      data: payments.map(withComputedStatus),
    });
  } catch (error) {
    console.error("Get rent payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rent payments",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE PAYMENT
// DELETE /rentandlease/payment/:id
// =====================================================

router.delete("/payment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Rent.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Rent payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rent payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete rent payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete rent payment",
      error: error.message,
    });
  }
});

// =====================================================
// GET PAYMENTS FOR ONE LEASE
// GET /rentandlease/:leaseId/payments
// =====================================================

router.get("/:leaseId/payments", async (req, res) => {
  try {
    const { leaseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(leaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lease ID",
      });
    }

    const payments = await Rent.find({
      leaseId,
    })
      .populate("leaseId")
      .sort({
        dueDate: -1,
      });

    return res.status(200).json({
      success: true,
      data: payments.map(withComputedStatus),
    });
  } catch (error) {
    console.error("Get lease payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lease payments",
      error: error.message,
    });
  }
});

export default router;
