
import { writeFile, appendFile } from 'fs/promises';
import { join } from 'path';

interface AuditLog {
  timestamp: Date;
  incidentId?: string;
  action?: string;
  [key: string]: any;
}

export class Auditor {
  private logFile = join(process.cwd(), 'agent-audit.log');

  async log(entry: AuditLog): Promise<void> {
    const logEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date()
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      await appendFile(this.logFile, logLine);
      console.log(`📋 Audit logged: ${entry.action || 'event'}`);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async getHistory(incidentId?: string): Promise<AuditLog[]> {
    try {
      const { readFile } = await import('fs/promises');
      const content = await readFile(this.logFile, 'utf-8');
      const logs = content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));

      if (incidentId) {
        return logs.filter(log => log.incidentId === incidentId);
      }

      return logs;
    } catch {
      return [];
    }
  }
}

export const auditor = new Auditor();
