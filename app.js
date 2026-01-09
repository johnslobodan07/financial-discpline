require("dotenv").config();
const connectDB = require("./src/configs/db");
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const { startCronJobs } = require("./src/services/cron.service");
const express = require("express");
morgan = require("morgan");
const app = express();

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  connectDB();
  startCronJobs();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan("common"));

  app.use("/api/export", require("./src/routes/export.routes"));
  app.use("/api/auth", require("./src/routes/auth.routes"));
  app.use("/api/savings", require("./src/routes/savings.routes"));
  app.use("/api/discipline", require("./src/routes/discipline.routes"));
  app.use("/api/goals", require("./src/routes/goals.routes"));

  const PORT = process.env.PORT || 5700;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
