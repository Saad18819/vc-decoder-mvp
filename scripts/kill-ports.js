const kill = require("kill-port");

const ports = [3000, 3001, 3002, 3003, 3004, 3005];
Promise.all(
  ports.map((p) =>
    kill(p).catch(() => {
      /* nothing listening */
    })
  )
).then(() => {
  console.log("Freed dev ports (if anything was listening).");
});
