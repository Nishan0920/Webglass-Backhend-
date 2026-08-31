import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import MongoDB from "../db.js";

import entry from "../Routes/Entry.js";
import customerData from "../Routes/Customers.js";
import inventoryData from "../Routes/Inventory.js";
import prescription from "../Routes/Prescriptions.js";
import staff from "../Routes/Staff.js";
import salary from "../Routes/Salary.js";
import RentAndLease from "../Routes/RentAndLease.js";
import expenses from "../Routes/Expenses.js";
import sales from "../Routes/Sales.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  "https://webglass-frontend.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await MongoDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.use("/api", entry);
app.use("/api", customerData);
app.use("/api", inventoryData);
app.use("/api", prescription);
app.use("/api", staff);
app.use("/api", salary);
app.use("/rentandlease", RentAndLease);
app.use("/api", expenses);
app.use("/api", sales);

app.get("/", (req, res) => {
  res.send("OptiFlow Backend is running");
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;