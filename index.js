const cluster = require("cluster");
const http = require("http");
const forks = require("os").cpus().length;

const scraper = require("./scraper");

const main = async (id, count) => {
  if (cluster.isMaster) {
    console.log(`Master: [${process.pid}] is running`);

    for (let i = 0; i < forks; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker [${worker.process.pid}] died`);
    });
  } else {
    const workerId = cluster.worker.id;

    console.log(`Worker ${workerId}: [${process.pid}] is running`);

    const threadCount = Math.ceil(count / forks);
    const startId = (id += threadCount * (workerId - 1));

    await scraper(startId, threadCount, workerId);

    cluster.worker.disconnect();
  }
};

main(40560097, 20000);
