import express from "express";
import Expenses from "../Models/Expensesmodal.js";

const router = express.Router();

/*
  GET ALL EXPENSES
  GET /api/expenses
  GET /api/expenses?tab=bills
  GET /api/expenses?tab=recurring
  GET /api/expenses?search=food
*/
router.get("/expenses", async (req, res) => {
  try {
    const {
      tab = "all",
      search = "",
      sortBy = "date",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Filter by tab
    if (tab === "bills") {
      query.isBill = true;
    }

    if (tab === "recurring") {
      query.isRecurring = true;
    }

    // Search
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [{ name: regex }, { category: regex }, { vendor: regex }];
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const sortDirection = order === "asc" ? 1 : -1;

    // IMPORTANT:
    // Use Expenses, not Expense
    const [expenses, total] = await Promise.all([
      Expenses.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limitNumber),

      Expenses.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    console.error("GET /expenses ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/*
  GET EXPENSE STATISTICS
  GET /api/expenses/stats
*/
router.get("/expenses/stats", async (req, res) => {
  try {
    const { month } = req.query;

    const now = month ? new Date(`${month}-01`) : new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // IMPORTANT:
    // Use Expenses, not Expense
    const monthExpenses = await Expenses.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const totalExpenses = monthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const billsCount = monthExpenses.filter(
      (expense) => expense.isBill === true,
    ).length;

    const categorySet = new Set(
      monthExpenses.map((expense) => expense.category).filter(Boolean),
    );

    const daysElapsed = Math.max(1, now.getDate());

    const avgPerDay = totalExpenses / daysElapsed;

    res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        billsCount,
        categoriesCount: categorySet.size,
        avgPerDay: Math.round(avgPerDay),
        month: startOfMonth.toISOString().slice(0, 7),
      },
    });
  } catch (err) {
    console.error("GET /expenses/stats ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/*
  CREATE EXPENSE
  POST /api/expenses
*/
router.post("/expenses", async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    // If expense is not recurring,
    // remove recurring frequency
    if (!payload.isRecurring) {
      payload.recurringFrequency = null;
    }

    const expense = await Expenses.create(payload);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    console.error("POST /expenses ERROR:", err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

/*
  UPDATE EXPENSE
  PUT /api/expenses/:id
*/
router.put("/expenses/:id", async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    if (payload.isRecurring === false) {
      payload.recurringFrequency = null;
    }

    const expense = await Expenses.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    console.error("PUT /expenses/:id ERROR:", err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

/*
  DELETE EXPENSE
  DELETE /api/expenses/:id
*/
router.delete("/expenses/:id", async (req, res) => {
  try {
    const expense = await Expenses.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    console.error("DELETE /expenses/:id ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
