import { Response } from 'express';

export interface SSEEvent {
  type: string;
  data: any;
}

export class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  // Map of userId -> array of active Response objects
  private connections: Map<string, Response[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHeartbeat();
  }

  public static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  public addConnection(userId: string, res: Response): void {
    const userConns = this.connections.get(userId) || [];
    userConns.push(res);
    this.connections.set(userId, userConns);

    // Send initial established connection event
    this.sendToResponse(res, { type: 'CONNECTED', data: { status: 'ok' } });
  }

  public removeConnection(userId: string, res: Response): void {
    const userConns = this.connections.get(userId) || [];
    const index = userConns.indexOf(res);
    if (index !== -1) {
      userConns.splice(index, 1);
    }
    if (userConns.length === 0) {
      this.connections.delete(userId);
    } else {
      this.connections.set(userId, userConns);
    }
  }

  public notifyUser(userId: string, event: SSEEvent): void {
    const userConns = this.connections.get(userId);
    if (!userConns) return;

    userConns.forEach((res) => {
      this.sendToResponse(res, event);
    });
  }

  private sendToResponse(res: Response, event: SSEEvent): void {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((userConns) => {
        userConns.forEach((res) => {
          // SSE Comment syntax is used for heartbeats to keep the TCP connection alive
          res.write(': heartbeat\n\n');
        });
      });
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Helper method for cleanup in test environments
  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.connections.clear();
  }
}
