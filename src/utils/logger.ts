import winston from 'winston';
import { FileTransportOptions } from 'winston/lib/winston/transports';

const transports = [];

const fileOption: FileTransportOptions = {
  handleExceptions: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5
};

const today = new Date();
const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

// In production env We will have one file which combine all type of logs (errors & info)
if (process.env.NODE_ENV !== 'development') {
  transports.push(new winston.transports.Console());
  transports.push(
    new winston.transports.File({
      filename: `./public/logs/${today.getFullYear()}/${today.getMonth() + 1}/${date}.log`
    })
  );
  // In dev env we just save errors into file and log all in terminal
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.cli(), winston.format.colorize(), winston.format.splat()),
      level: 'info'
    })
  );
  transports.push(
    new winston.transports.File({
      filename: `./public/logs/${today.getFullYear()}/${today.getMonth() + 1}/${date}.log`,
      level: 'error',
      ...fileOption
    })
  );
}

const format = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.simple()
);

export const LoggerInstance = winston.createLogger({
  level: 'info',
  format,
  transports
});
