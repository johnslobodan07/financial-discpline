const router = require("express").Router();
const SavingsGoal = require("../models/Goal");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, async (req, res) => {
  const goal = await SavingsGoal.create({
    ...req.body,
    userId: req.user.id,
  });
  await goal.save();
  return res.status(201).json(goal);
});

router.get("/", auth, async (req, res) => {
  const goals = await SavingsGoal.find({ userId: req.user.id });
  return res.json(goals);
});

module.exports = router;
