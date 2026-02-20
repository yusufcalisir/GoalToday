export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Console output for development
    if (__DEV__) {
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[34m';
        console.log(`${color}[${level}] ${message}\x1b[0m`, data ? data : '');
    }

    // In-memory buffer for Debug View
    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }
  }

  debug(message: string, data?: any) { this.log('DEBUG', message, data); }
  info(message: string, data?: any) { this.log('INFO', message, data); }
  warn(message: string, data?: any) { this.log('WARN', message, data); }
  error(message: string, data?: any) { this.log('ERROR', message, data); }

  getLogs() { return this.logs; }
  clear() { this.logs = []; }
}

export const logger = new LoggerService();
