import app from "./app";
import { logger } from "./lib/logger";

const startPort = Number(process.env["PORT"] ?? "3001");
let port = startPort;
const maxAttempts = 10;
let attempts = 0;

function startServer() {
  app.listen(port, (err) => {
    if (err) {
      if ((err as any)?.code === "EADDRINUSE" && attempts < maxAttempts) {
        logger.warn({ port, attempts }, "Port in use, trying next port");
        port++;
        attempts++;
        startServer();
      } else {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
    } else {
      logger.info({ port }, "Server listening");
    }
  });
}

startServer();
