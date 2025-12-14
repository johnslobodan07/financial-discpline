const cron = require("node-cron");
const User = require("../models/User");
const { DateTime } = require("luxon");
const { evaluateDailyForUser } = require("./discipline.service");

exports.startCronJobs = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Timezone discipline scan running");

    const users = await User.find({}, "_id timezone");

    for (const user of users) {
      const now = DateTime.now().setZone(user.timezone);

      // Evaluate only between 23:54–23:59 local time
      if (now.hour === 23 && now.minute < 59) {
        console.log(
          `Evaluating discipline for user ${user._id} in timezone ${user.timezone}`
        );
        await evaluateDailyForUser(user);
      }
    }
  });
};
