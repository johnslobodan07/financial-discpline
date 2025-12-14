const Saving = require("../models/Savings");
const { getLocalDate } = require("./date.util");

exports.addSaving = async (user, payload) => {
  const today = getLocalDate(
    user.timezone ? user.timezone : "Africa/Dar_es_Salaam"
  );
  return Saving.create({
    userId: user._id,
    amount: payload.amount,
    category: payload.category,
    source: payload.source,
    date: today,
  });
};
