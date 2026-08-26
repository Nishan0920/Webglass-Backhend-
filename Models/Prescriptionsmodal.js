import mongoose from "mongoose";

const eyeSchema = new mongoose.Schema(
  {
    sph: {
      type: String,
      default: "",
      trim: true,
    },

    cyl: {
      type: String,
      default: "",
      trim: true,
    },

    axis: {
      type: String,
      default: "",
      trim: true,
    },

    add: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const prescriptionsSchema = new mongoose.Schema(
  {
    PrescriptionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER REFERENCE
    |--------------------------------------------------------------------------
    |
    | MongoDB stores the customer's ObjectId here.
    | The frontend does NOT show this ID.
    |
    */

    Customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    Date: {
      type: Date,
      default: Date.now,
    },

    Type: {
      type: String,
      enum: [
        "Single Vision",
        "Bifocal",
        "Progressive",
      ],
      required: true,
    },

    RightEye: {
      type: eyeSchema,
      default: () => ({}),
    },

    LeftEye: {
      type: eyeSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

const prescriptionsData = mongoose.model(
  "prescription",
  prescriptionsSchema,
);

export default prescriptionsData;