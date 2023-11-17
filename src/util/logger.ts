import { format } from "winston";

const winston = require("winston");

const loggerFormat = format.printf((info) => {
  return `${info.level} ${info.timestamp}: ${info.message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    loggerFormat
  ),
  transports: [new winston.transports.Console()],
});
