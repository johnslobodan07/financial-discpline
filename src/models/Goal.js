const mongoose = require("mongoose");

const SavingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    monthlyTarget: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: String,
    endDate: String,
    status: {
      type: String,
      enum: ["on-track", "at-risk", "failed", "achieved"],
      default: "on-track",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavingsGoal", SavingsGoalSchema);
