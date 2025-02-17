import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import chalk from "chalk";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const method = chalk.bold.blue(req.method);
      const pathText = chalk.green(path);
      const status = res.statusCode < 400 
        ? chalk.bold.green(res.statusCode)
        : chalk.bold.red(res.statusCode);
      const durationText = chalk.yellow(`${duration}ms`);

      let logLine = `${method} ${pathText} ${status} in ${durationText}`;

      if (capturedJsonResponse) {
        const jsonText = chalk.gray(JSON.stringify(capturedJsonResponse));
        logLine += ` :: ${jsonText}`;
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + chalk.gray("…");
      }

      const timestamp = new Date().toLocaleTimeString();
      console.log(chalk.gray(`[${timestamp}]`), logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(chalk.red("Error:"), chalk.red(err.stack || err));
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(
      chalk.cyan("[Server]"),
      chalk.green(`serving on port ${PORT}`)
    );
  });

  // Auto-monitoring system
  setInterval(() => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    console.log(
      chalk.magenta("[Monitor]"),
      chalk.blue(`Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`),
      chalk.blue(`Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`)
    );
  }, 60000); // Check every minute
})();