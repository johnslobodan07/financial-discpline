const router = require("express").Router();
const { addSaving } = require("../services/savings.service");
const { evaluateDailyForUser } = require("../services/discipline.service");
const auth = require("../middleware/auth.middleware");
const SavingsGoal = require("../models/Goal");
const Saving = require("../models/Savings");

router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId, amount, category, source, date } = req.body;

    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(400).json({ error: "Invalid savings goal" });

    if (goal.status === "failed")
      return res.status(403).json({ error: "Goal already failed" });

    const saving = await Saving.create({
      userId,
      goalId,
      amount,
      category,
      source,
      date,
    });
    await evaluateDailyForUser(req.user);

    res.status(201).json(saving);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Savings already recorded for this goal today" });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
