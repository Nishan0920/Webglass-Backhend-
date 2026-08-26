import express from "express";
import Staff from "../Models/Staffmodal.js";
import { body, validationResult } from "express-validator";
const router = express.Router();
//for creating a new staff
router.post(
  "/staff",
  [
    body("StaffName").isString(),
    body("Email").isEmail().withMessage("Invalid email"),
    body("PhoneNumber")
      .isString()
      .matches(/^\d{10}$/)
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number must be exactly 10 digits"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({
          errors: result.array(),
        });
      }
      const { StaffName, PhoneNumber, Designation, Email } = req.body;
      const newStaff = await Staff.create({
        StaffName,
        PhoneNumber,
        Designation,
        Email,
      });
      res.status(201).json({
        success: true,
        message: "Staff created successfully",
        newStaff,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);
router.get("/staffalldata", async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.put(
  "/staff/:id",
  [
    body("StaffName").isString().isLength({ min: 2 }),

    body("Email").isEmail().withMessage("Invalid email"),

    body("PhoneNumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({
          errors: result.array(),
        });
      }

      const { StaffName, Email, PhoneNumber, Designation } = req.body;

      const staff = await Staff.findByIdAndUpdate(
        req.params.id,
        {
          StaffName,
          Email,
          PhoneNumber,
          Designation,
        },
        {
          new: true,
        },
      );

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Staff updated successfully",
        staff,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);
router.delete("/staff/:id", async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
