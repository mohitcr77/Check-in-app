import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info',  // Set the minimum log level that will be captured
    format: format.combine(
        format.colorize(),  // Add color to logs for easier reading in the console
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Include timestamp in each log
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),  // Log to the console
        new transports.File({ filename: 'logs/error.log', level: 'error' }),  // Log errors to a file
        new transports.File({ filename: 'logs/combined.log' })  // Log all levels to a file
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })  // Log uncaught exceptions
    ]
});

export default logger;
