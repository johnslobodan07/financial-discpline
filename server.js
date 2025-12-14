require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/configs/db");
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const { startCronJobs } = require("./src/services/cron.service");

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

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
