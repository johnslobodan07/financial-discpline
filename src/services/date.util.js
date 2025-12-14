const { DateTime } = require("luxon");

exports.getLocalDate = (timezone) =>
  DateTime.now().setZone(timezone).toISODate();

exports.getLocalHourMinute = (timezone) =>
  DateTime.now().setZone(timezone).toFormat("HH:mm");
