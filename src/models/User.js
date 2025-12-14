const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  timezone: {
    type: String,
    required: true,
    default: "Africa/Dar_es_Salaam", // sensible default for you
  },
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
