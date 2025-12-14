const mongoose = require("mongoose");

const DisciplineStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
    required: true,
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  missedDaysThisMonth: { type: Number, default: 0 },
  consistencyScore: { type: Number, default: 100 },
  disciplineGrade: { type: String, default: "A" },
  recoveryMode: { type: Boolean, default: false },
  lastEvaluatedDate: String,
});

module.exports = mongoose.model("DisciplineState", DisciplineStateSchema);
