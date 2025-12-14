const mongoose = require("mongoose");

const DisciplineEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "SAVED",
        "MISSED",
        "WARNING",
        "RECOVERY_ON",
        "RECOVERY_OFF",
        "GOAL_FAILED",
      ],
      required: true,
    },
    date: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DisciplineEvent", DisciplineEventSchema);
