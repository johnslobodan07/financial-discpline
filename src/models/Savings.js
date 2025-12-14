// models/Saving.js
const mongoose = require("mongoose");

const SavingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingsGoal",
      index: true,
    },

    amount: {
      type: Number,
      min: 1,
      required: true,
    },

    date: {
      type: String,
      required: true, // YYYY-MM-DD
      index: true,
    },

    category: {
      type: String,
      enum: ["emergency", "growth", "opportunity", "investment"],
      required: true,
    },

    source: {
      type: String,
      enum: ["salary", "business", "side-income"],
      required: true,
    },
  },
  { timestamps: true }
);

// OPTIONAL: prevent exact duplicate saves (same amount, same time)
SavingSchema.index(
  { userId: 1, goalId: 1, amount: 1, createdAt: 1 },
  { unique: false }
);

// HARD IMMUTABILITY
SavingSchema.pre("findOneAndUpdate", () => {
  throw new Error("Savings cannot be edited");
});
SavingSchema.pre("updateOne", () => {
  throw new Error("Savings cannot be edited");
});

module.exports = mongoose.model("Saving", SavingSchema);
