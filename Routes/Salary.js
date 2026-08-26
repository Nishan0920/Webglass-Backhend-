import express from "express";
import Salary from "../Models/Salarymodal.js";
import Staff from "../Models/Staffmodal.js";
import { body, validationResult } from "express-validator";
const router = express.Router();

// helper to keep create/update in sync
const calcNet = (basic, allowances = 0, deductions = 0) =>
  Number(basic) + Number(allowances) - Number(deductions);

// for creating a new salary record, linked to an existing staff member
router.post(
  "/salary",
  [
    body("Staff").isMongoId().withMessage("A valid staff member must be selected"),
    body("Month").isString().notEmpty().withMessage("Month is required"),
    body("BasicSalary").isNumeric().withMessage("Basic salary must be a number"),
    body("Allowances").optional().isNumeric().withMessage("Allowances must be a number"),
    body("Deductions").optional().isNumeric().withMessage("Deductions must be a number"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const {
        Staff: staffId,
        Month,
        BasicSalary,
        Allowances = 0,
        Deductions = 0,
        Status,
        PaymentMethod,
        PayDate,
      } = req.body;

      
      const staffExists = await Staff.findById(staffId);
      if (!staffExists) {
        return res.status(404).json({ success: false, message: "Staff member not found" });
      }

      const NetSalary = calcNet(BasicSalary, Allowances, Deductions);

      const newSalary = await Salary.create({
        Staff: staffId,
        Month,
        BasicSalary,
        Allowances,
        Deductions,
        NetSalary,
        Status,
        PaymentMethod,
        PayDate,
      });

      const populated = await newSalary.populate("Staff", "StaffName Designation PhoneNumber Email");

      res.status(201).json({
        success: true,
        message: "Salary created successfully",
        newSalary: populated,
      });
    } catch (error) {
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "A salary record for this staff member and month already exists",
        });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// get all salary records with staff name/designation attached
router.get("/salaryalldata", async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("Staff", "StaffName Designation PhoneNumber Email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      salaries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// update an existing salary record
router.put(
  "/salary/:id",
  [
    body("Month").optional().isString().notEmpty(),
    body("BasicSalary").optional().isNumeric().withMessage("Basic salary must be a number"),
    body("Allowances").optional().isNumeric().withMessage("Allowances must be a number"),
    body("Deductions").optional().isNumeric().withMessage("Deductions must be a number"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const existing = await Salary.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Salary record not found" });
      }

      const {
        Month = existing.Month,
        BasicSalary = existing.BasicSalary,
        Allowances = existing.Allowances,
        Deductions = existing.Deductions,
        Status = existing.Status,
        PaymentMethod = existing.PaymentMethod,
        PayDate = existing.PayDate,
      } = req.body;

      const NetSalary = calcNet(BasicSalary, Allowances, Deductions);

      const salary = await Salary.findByIdAndUpdate(
        req.params.id,
        { Month, BasicSalary, Allowances, Deductions, NetSalary, Status, PaymentMethod, PayDate },
        { new: true }
      ).populate("Staff", "StaffName Designation PhoneNumber Email");

      res.status(200).json({
        success: true,
        message: "Salary updated successfully",
        salary,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// delete a salary record
router.delete("/salary/:id", async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }
    res.status(200).json({
      success: true,
      message: "Salary deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;