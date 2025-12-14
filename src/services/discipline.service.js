const DisciplineState = require("../models/Displine");
const DisciplineEvent = require("../models/DisplineEvent");
const Saving = require("../models/Savings");
const { getLocalDate } = require("./date.util");

exports.evaluateDailyForUser = async (user) => {
  const today = getLocalDate(
    user.timezone ? user.timezone : "Africa/Dar_es_Salaam"
  );

  let state = await DisciplineState.findOne({ userId: user._id });
  if (!state) state = await DisciplineState.create({ userId: user._id });

  if (state.lastEvaluatedDate === today) return;

  const saved = await Saving.exists({
    userId: user._id,
    date: today,
  });

  if (saved) {
    state.currentStreak++;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);

    await DisciplineEvent.create({
      userId: user._id,
      type: "SAVED",
      date: today,
    });
  } else {
    state.currentStreak = 0;
    state.missedDaysThisMonth++;

    await DisciplineEvent.create({
      userId: user._id,
      type: "MISSED",
      date: today,
    });
  }

  state.lastEvaluatedDate = today;
  await state.save();
};
