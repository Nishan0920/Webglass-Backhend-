import express from "express";
import {
  body,
  validationResult,
} from "express-validator";

import Data from "../Models/Customersmodal.js";

const router = express.Router();


// ==========================================
// CREATE CUSTOMER
// ==========================================

router.post(
  "/customer",

  [
    body("Name")
      .isString()
      .isLength({ min: 2 })
      .withMessage(
        "Name must be at least 2 characters"
      ),

    body("Email")
      .isEmail()
      .withMessage("Invalid email"),

    body("PhoneNumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage(
        "Phone number must be exactly 10 digits"
      ),

    body("Address")
      .isString()
      .notEmpty()
      .withMessage("Address is required"),
  ],

  async (req, res) => {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: result.array()[0].msg,
          errors: result.array(),
        });
      }

      const {
        Name,
        Email,
        PhoneNumber,
        Address,
      } = req.body;

      const customer = await Data.create({
        Name,
        Email,
        PhoneNumber,
        Address,
      });

      return res.status(201).json({
        success: true,
        message:
          "Customer created successfully",
        customer,
      });

    } catch (error) {
      console.error(
        "Create customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ==========================================
// GET ALL CUSTOMERS
// ==========================================

router.get(
  "/customeralldata",
  async (req, res) => {
    try {
      const customers = await Data.find().sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        customers,
      });

    } catch (error) {
      console.error(
        "Get customers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ==========================================
// GET SINGLE CUSTOMER
// ==========================================

router.get(
  "/customer/:id",
  async (req, res) => {
    try {
      const customer =
        await Data.findById(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        success: true,
        customer,
      });

    } catch (error) {
      console.error(
        "Get customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ==========================================
// UPDATE CUSTOMER
// ==========================================

router.put(
  "/customer/:id",

  [
    body("Name")
      .isString()
      .isLength({ min: 2 })
      .withMessage(
        "Name must be at least 2 characters"
      ),

    body("Email")
      .isEmail()
      .withMessage("Invalid email"),

    body("PhoneNumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage(
        "Phone number must be exactly 10 digits"
      ),

    body("Address")
      .isString()
      .notEmpty()
      .withMessage("Address is required"),
  ],

  async (req, res) => {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: result.array()[0].msg,
          errors: result.array(),
        });
      }

      const {
        Name,
        Email,
        PhoneNumber,
        Address,
      } = req.body;

      const customer =
        await Data.findByIdAndUpdate(
          req.params.id,

          {
            Name,
            Email,
            PhoneNumber,
            Address,
          },

          {
            new: true,
            runValidators: true,
          }
        );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Customer updated successfully",
        customer,
      });

    } catch (error) {
      console.error(
        "Update customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ==========================================
// DELETE CUSTOMER
// ==========================================

router.delete(
  "/customer/:id",
  async (req, res) => {
    try {
      const customer =
        await Data.findByIdAndDelete(
          req.params.id
        );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Customer deleted successfully",
      });

    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


export default router;