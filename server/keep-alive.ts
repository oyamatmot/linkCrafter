import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import chalk from "chalk";

export class KeepAliveService {
  private static instance: KeepAliveService;
  private wsServer: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private restartAttempts = 0;

  private constructor(server: any) {
    this.wsServer = new WebSocketServer({ 
      server,
      path: "/ws",
      perMessageDeflate: false
    });
    this.setupWebSocket();
    this.startHealthCheck();
  }

  static initialize(server: any) {
    if (!KeepAliveService.instance) {
      KeepAliveService.instance = new KeepAliveService(server);
    }
    return KeepAliveService.instance;
  }

  private setupWebSocket() {
    this.wsServer.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
      ws.on('error', (error) => {
        console.error(chalk.red('WebSocket error:', error));
      });
    });
  }

  private async notifyUsers(message: string, type: 'error' | 'info') {
    try {
      // Instead of using storage.createNotification, we'll log the notification
      console.log(chalk.yellow(`[${type.toUpperCase()}] ${message}`));
      // Broadcast to all connected WebSocket clients
      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type, message }));
        }
      });
    } catch (error) {
      console.error(chalk.red('Failed to send notifications:', error));
    }
  }

  private startHealthCheck() {
    this.checkInterval = setInterval(async () => {
      try {
        const response = await fetch('http://0.0.0.0:5000/api/health');
        if (!response.ok) {
          throw new Error('Health check failed');
        }
        this.restartAttempts = 0;
      } catch (error) {
        console.error(chalk.red('Health check failed:', error));
        this.restartAttempts++;

        if (this.restartAttempts >= 3) {
          await this.notifyUsers('Application experienced issues and is attempting to restart', 'error');
          process.exit(1); // This will trigger Replit's auto-restart
        }
      }
    }, 60000); // Check every minute
  }

  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.wsServer.close(() => {
      console.log(chalk.yellow('WebSocket server closed'));
    });
  }
}