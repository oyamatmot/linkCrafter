
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import chalk from "chalk";

export class KeepAliveService {
  private static instance: KeepAliveService;
  private wsServer: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private checkInterval: NodeJS.Timer;
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
          // Kill any existing process on port 5000
          try {
            await new Promise((resolve) => {
              const kill = require('child_process').spawn('kill', ['-9', `$(lsof -t -i:5000)`], {shell: true});
              kill.on('close', resolve);
            });
          } catch (error) {
            console.error('Failed to kill process:', error);
          }
          
          // Restart the application
          setTimeout(() => {
            process.exit(1); // This will trigger Replit's auto-restart
          }, 1000);
        }
      }
    }, 60000);
  }

  cleanup() {
    clearInterval(this.checkInterval);
    this.wsServer.close();
  }
}
