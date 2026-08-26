import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

import prescriptionsData from "../Models/Prescriptionsmodal.js";
import Data from "../Models/Customersmodal.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanEye = (eye = {}) => ({
  sph: String(eye?.sph ?? "").trim(),
  cyl: String(eye?.cyl ?? "").trim(),
  axis: String(eye?.axis ?? "").trim(),
  add: String(eye?.add ?? "").trim(),
});

const prescriptionValidation = [
  body("PrescriptionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Prescription ID is required"),

  body("Customer")
    .isMongoId()
    .withMessage("Valid customer is required"),

  body("Type")
    .isIn(["Single Vision", "Bifocal", "Progressive"])
    .withMessage("Invalid prescription type"),
];

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS FOR PRESCRIPTION DROPDOWN
|--------------------------------------------------------------------------
|
| This endpoint is specifically for the prescription page.
| The frontend receives customer names and IDs internally,
| but only the customer name is displayed to the user.
|
*/

router.get("/prescription/customers", async (req, res) => {
  try {
    const customers = await Data.find({})
      .select("_id Name PhoneNumber Email Address")
      .sort({ Name: 1 });

    return res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Get customers for prescription error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE PRESCRIPTION
|--------------------------------------------------------------------------
*/

router.post(
  "/prescription",
  prescriptionValidation,
  async (req, res) => {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: result.array(),
        });
      }

      const {
        PrescriptionId,
        Customer,
        Date,
        Type,
        RightEye,
        LeftEye,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | CHECK CUSTOMER
      |--------------------------------------------------------------------------
      */

      if (!isValidObjectId(Customer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer",
        });
      }

      const customer = await Data.findById(Customer);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK DUPLICATE PRESCRIPTION ID
      |--------------------------------------------------------------------------
      */

      const existingPrescription = await prescriptionsData.findOne({
        PrescriptionId: PrescriptionId.trim(),
      });

      if (existingPrescription) {
        return res.status(409).json({
          success: false,
          message: "Prescription ID already exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      const prescription = await prescriptionsData.create({
        PrescriptionId: PrescriptionId.trim(),

        Customer,

        Date: Date || new Date(),

        Type,

        RightEye: cleanEye(RightEye),

        LeftEye: cleanEye(LeftEye),
      });

      /*
      |--------------------------------------------------------------------------
      | POPULATE CUSTOMER
      |--------------------------------------------------------------------------
      */

      await prescription.populate(
        "Customer",
        "Name PhoneNumber Email Address",
      );

      return res.status(201).json({
        success: true,
        message: "Prescription created successfully",
        prescription,
      });
    } catch (error) {
      console.error("Create prescription error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Prescription ID already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET ALL PRESCRIPTIONS
|--------------------------------------------------------------------------
*/

router.get("/prescriptionalldata", async (req, res) => {
  try {
    const prescriptions = await prescriptionsData
      .find()
      .populate(
        "Customer",
        "Name PhoneNumber Email Address",
      )
      .sort({
        Date: -1,
        createdAt: -1,
      });

    const formattedPrescriptions = prescriptions.map(
      (prescription) => {
        const data = prescription.toObject();

        return {
          ...data,

          // Keep the customer ObjectId internally.
          // The JSX will NEVER display it.
          Customer:
            prescription.Customer?._id?.toString() || null,

          CustomerName:
            prescription.Customer?.Name || "",

          CustomerPhone:
            prescription.Customer?.PhoneNumber || "",

          CustomerEmail:
            prescription.Customer?.Email || "",

          CustomerAddress:
            prescription.Customer?.Address || "",
        };
      },
    );

    return res.status(200).json({
      success: true,
      prescriptions: formattedPrescriptions,
    });
  } catch (error) {
    console.error("Get all prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET PRESCRIPTIONS OF ONE CUSTOMER
|--------------------------------------------------------------------------
*/

router.get(
  "/prescription/customer/:customerId",
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!isValidObjectId(customerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Data.findById(customerId).select(
        "_id Name PhoneNumber Email Address",
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const prescriptions = await prescriptionsData
        .find({
          Customer: customerId,
        })
        .populate(
          "Customer",
          "Name PhoneNumber Email Address",
        )
        .sort({
          Date: -1,
          createdAt: -1,
        });

      const formattedPrescriptions = prescriptions.map(
        (prescription) => {
          const data = prescription.toObject();

          return {
            ...data,

            Customer:
              prescription.Customer?._id?.toString() ||
              null,

            CustomerName:
              prescription.Customer?.Name || "",

            CustomerPhone:
              prescription.Customer?.PhoneNumber || "",

            CustomerEmail:
              prescription.Customer?.Email || "",

            CustomerAddress:
              prescription.Customer?.Address || "",
          };
        },
      );

      return res.status(200).json({
        success: true,
        customer,
        prescriptions: formattedPrescriptions,
      });
    } catch (error) {
      console.error(
        "Get customer prescriptions error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET SINGLE PRESCRIPTION
|--------------------------------------------------------------------------
*/

router.get("/prescription/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const prescription = await prescriptionsData
      .findById(id)
      .populate(
        "Customer",
        "Name PhoneNumber Email Address",
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE PRESCRIPTION
|--------------------------------------------------------------------------
*/

router.put(
  "/prescription/:id",
  prescriptionValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid prescription ID",
        });
      }

      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: result.array(),
        });
      }

      const {
        PrescriptionId,
        Customer,
        Date,
        Type,
        RightEye,
        LeftEye,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | CHECK CUSTOMER
      |--------------------------------------------------------------------------
      */

      if (!isValidObjectId(Customer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer",
        });
      }

      const customer = await Data.findById(Customer);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | DUPLICATE PRESCRIPTION ID
      |--------------------------------------------------------------------------
      */

      const duplicate = await prescriptionsData.findOne({
        PrescriptionId: PrescriptionId.trim(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Prescription ID already exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      const prescription =
        await prescriptionsData.findByIdAndUpdate(
          id,
          {
            PrescriptionId: PrescriptionId.trim(),

            Customer,

            Date: Date || new Date(),

            Type,

            RightEye: cleanEye(RightEye),

            LeftEye: cleanEye(LeftEye),
          },
          {
            new: true,
            runValidators: true,
          },
        );

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      await prescription.populate(
        "Customer",
        "Name PhoneNumber Email Address",
      );

      return res.status(200).json({
        success: true,
        message: "Prescription updated successfully",
        prescription,
      });
    } catch (error) {
      console.error("Update prescription error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Prescription ID already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| DELETE PRESCRIPTION
|--------------------------------------------------------------------------
*/

router.delete("/prescription/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const prescription =
      await prescriptionsData.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;