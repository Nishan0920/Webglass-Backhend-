import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

import MongoDB from "./db.js";
import entry from "./Routes/Entry.js";
import customerData from "./Routes/Customers.js";
import inventoryData from "./Routes/Inventory.js";
import prescription from "./Routes/Prescriptions.js";
import staff from "./Routes/Staff.js";
import salary from "./Routes/Salary.js";
import RentAndLease from "./Routes/RentAndLease.js";
import expenses from "./Routes/Expenses.js";
import sales from "./Routes/Sales.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

MongoDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

export default app;
