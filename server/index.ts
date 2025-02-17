import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import chalk from "chalk";
import crypto from "crypto";
import { aiService } from "./services/ai-service";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Encrypted credits (using a simple XOR encryption for demonstration)
const encryptedCredits = Buffer.from("Credits to: Mot Oyamat").map(b => b ^ 0x42);
const decryptCredits = () => Buffer.from(encryptedCredits).map(b => b ^ 0x42).toString();

// ASCII Art Title
console.log(chalk.bold.cyan(`
╦  ┬┌┐┌┬┌─╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐┬─┐
║  ││││├┴┐║  ├┬┘├─┤├┤  │ ├┤ ├┬┘
╩═╝┴┘└┘┴ ┴╚═╝┴└─┴ ┴└   ┴ └─┘┴└─
`));
console.log(chalk.bold.magenta("Version 1.0.0"));
console.log(chalk.dim.cyan(decryptCredits()));

// Modern request logging middleware
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
      const method = chalk.bold.blue(`[${req.method}]`);
      const pathText = chalk.green(path);
      const status = res.statusCode < 400
        ? chalk.bold.green(`[${res.statusCode}]`)
        : chalk.bold.red(`[${res.statusCode}]`);
      const durationText = chalk.yellow(`⚡${duration}ms`);

      let logLine = `${method} ${pathText} ${status} ${durationText}`;

      if (capturedJsonResponse) {
        const jsonText = chalk.gray(JSON.stringify(capturedJsonResponse));
        logLine += ` 📦 ${jsonText}`;
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + chalk.gray("…");
      }

      const timestamp = chalk.dim.cyan(`[${new Date().toLocaleTimeString()}]`);
      console.log(`${timestamp} ${logLine}`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  const { KeepAliveService } = await import('./keep-alive');
  KeepAliveService.initialize(server);

  // Initialize AI Service
  try {
    await aiService.initialize();
    console.log(chalk.green("✓ AI Service initialized"));

    // Schedule AI tasks with shorter intervals for testing
    setInterval(async () => {
      try {
        await aiService.generateAndCreateLink();
        console.log(chalk.blue("🤖 AI generated new link"));
      } catch (error) {
        console.error(chalk.red("Error in AI link generation:"), error);
      }
    }, 60000); // Every 1 minute

    // Schedule AI interaction with public links
    setInterval(async () => {
      try {
        await aiService.clickRandomPublicLinks();
        console.log(chalk.blue("🤖 AI interacted with public links"));
      } catch (error) {
        console.error(chalk.red("Error in AI link interaction:"), error);
      }
    }, 30000); // Every 30 seconds
  } catch (error) {
    console.error(chalk.red("Failed to initialize AI Service:"), error);
  }

  // Modern error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(chalk.bold.red("🚨 Error:"), chalk.red(err.stack || err));
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
  process.on('uncaughtException', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log('Port in use, attempting to restart...');
      process.exit(1); // This will trigger Replit's auto-restart
    }
  });
    console.log(
      chalk.bold.cyan("🚀 Server"),
      chalk.green(`running on port ${PORT}`)
    );
  });

  // Modern monitoring system
  setInterval(() => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    console.log(
      chalk.bold.magenta("📊 Monitor"),
      chalk.blue(`⏱️ Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`),
      chalk.blue(`💾 Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`)
    );
  }, 60000);

  // Verify author in package.json
  try {
    const pkg = await import('../package.json', { assert: { type: 'json' } });
    if (pkg.default.author !== "Mot Oyamat") {
      console.error(chalk.bold.red("🛑 Error: Invalid author in package.json. This application is licensed to Mot Oyamat."));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.bold.red("🛑 Error: Could not verify package.json author."));
    process.exit(1);
  }
})();