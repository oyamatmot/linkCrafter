
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import chalk from "chalk";

export class KeepAliveService {
  private static instance: KeepAliveService;
  private wsServer: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private checkInterval: NodeJS.Timer;
  private restartAttempts = 0;
  
  private constructor(server: any) {
    this.wsServer = new WebSocketServer({ server });
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
    this.wsServer.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
    });
  }

  private async notifyUsers(message: string, type: 'error' | 'info') {
    try {
      const users = await storage.getAllUsers();
      for (const user of users) {
        await storage.createNotification(user.id, {
          title: type === 'error' ? 'System Error' : 'System Info',
          message,
          type
        });
      }
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
          process.exit(1); // Replit will automatically restart the process
        }
      }
    }, 60000); // Check every minute
  }

  cleanup() {
    clearInterval(this.checkInterval);
    this.wsServer.close();
  }
}
