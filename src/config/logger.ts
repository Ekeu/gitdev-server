import winston from "winston";
import _ from "lodash";

const winstonLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "green",
    trace: "white",
  },
};

const winstonFormatter = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = _.isEmpty(meta) ? "" : JSON.stringify(meta, null, 2);
    return `[${timestamp}] [${level}] : ${message} ${metaString}`;
  }),
);

class WinstonLogger {
  private logger: winston.Logger;

  constructor() {
    const transport = new winston.transports.Console({
      format: winstonFormatter,
    });

    this.logger = winston.createLogger({
      level: "trace",
      levels: winstonLevels.levels,
      transports: [transport],
    });

    winston.addColors(winstonLevels.colors);
  }

  public trace(message: string, meta?: any): void {
    this.logger.log("trace", message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public fatal(message: string, meta?: any): void {
    this.logger.log("fatal", message, meta);
  }
}

export const logger = new WinstonLogger();
