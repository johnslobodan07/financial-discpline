const router = require("express").Router();
const DisciplineState = require("../models/Displine");
const DisciplineEvent = require("../models/DisplineEvent");
const auth = require("../middleware/auth.middleware");

router.get("/state", auth, async (req, res) => {
  const state = await DisciplineState.findOne({ userId: req.user.id });
  res.json(state);
});

router.get("/events", auth, async (req, res) => {
  const events = await DisciplineEvent.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(events);
});

module.exports = router;
