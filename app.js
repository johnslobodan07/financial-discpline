const express = require("express");
morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("common"));

app.use("/api/export", require("./src/routes/export.routes"));
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/savings", require("./src/routes/savings.routes"));
app.use("/api/discipline", require("./src/routes/discipline.routes"));
app.use("/api/goals", require("./src/routes/goals.routes"));

module.exports = app;
