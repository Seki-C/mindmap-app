import winston from 'winston';
import chalk from 'chalk';

export interface LoggerOptions {
  level?: string;
  silent?: boolean;
  timestamp?: boolean;
  colorize?: boolean;
}

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'green',
    verbose: 'gray',
  },
};

class Logger {
  private winston: winston.Logger;
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level || 'info',
      silent: options.silent || false,
      timestamp: options.timestamp !== false,
      colorize: options.colorize !== false,
    };

    const formats = [winston.format.simple()];

    if (this.options.timestamp) {
      formats.unshift(winston.format.timestamp());
    }

    if (this.options.colorize) {
      formats.push(winston.format.colorize());
    }

    this.winston = winston.createLogger({
      levels: customLevels.levels,
      level: this.options.level,
      silent: this.options.silent,
      format: winston.format.combine(...formats),
      transports: [
        new winston.transports.Console({
          format: winston.format.printf((info) => {
            const timestamp = info.timestamp
              ? chalk.gray(`[${info.timestamp}]`)
              : '';
            const level = this.colorizeLevel(info.level);
            return `${timestamp} ${level}: ${info.message}`;
          }),
        }),
      ],
    });

    winston.addColors(customLevels.colors);
  }

  private colorizeLevel(level: string): string {
    if (!this.options.colorize) return level.toUpperCase();

    switch (level) {
      case 'error':
        return chalk.red(level.toUpperCase());
      case 'warn':
        return chalk.yellow(level.toUpperCase());
      case 'info':
        return chalk.blue(level.toUpperCase());
      case 'debug':
        return chalk.green(level.toUpperCase());
      case 'verbose':
        return chalk.gray(level.toUpperCase());
      default:
        return level.toUpperCase();
    }
  }

  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.winston.verbose(message, meta);
  }

  setLevel(level: string): void {
    this.winston.level = level;
  }

  setSilent(silent: boolean): void {
    this.winston.silent = silent;
  }
}

export default Logger;