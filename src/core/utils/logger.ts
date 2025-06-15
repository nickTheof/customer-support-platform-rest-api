import winston, {Logger} from "winston";
import "winston-daily-rotate-file";
import "winston-mongodb"
import env_config from "../env_config";
const {transports, format} = winston;
const { combine, timestamp, printf, json, colorize } = format;

// create a default winston format to use in all production transports
const formatDefault: winston.Logform.Format = combine(
    timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    json()
);

const logger: Logger = winston.createLogger({
    format: formatDefault
});

// Create a console transport for the development environment
const devConsoleTransport = new transports.Console({
    format: combine(
        colorize(),
        printf(
            ({ level, message, timestamp }: winston.Logform.TransformableInfo ): string => `${timestamp} [${level}]: ${message}`
        )
    ),
});

// Create a file transport for the production environment
const prodFileTransport = new transports.DailyRotateFile({
    filename: "logs/blogs-rest-app-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d"
})

// Create a file transport for only warn level logs in production
const criticalProdLogsFileTransport = new transports.File({
    filename: "./logs/error.log",
    level: "error",
});

const mongodbProdLogsTransport = new winston.transports.MongoDB({
    level: "info",
    db: `mongodb+srv://${env_config.MONGODB_USER}:${env_config.MONGODB_PASSWORD}@${env_config.MONGODB_CLUSTER_URI}${env_config.MONGODB_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`,
    collection: "production_server_logs",
});

// Create File transport for exception handler in production
const exceptionsLogsFileTransport = new transports.File({
    filename: "./logs/exceptions.log",
});

// Create File transport for rejection handler in production
const rejectionsLogsFileTransport = new transports.File({
    filename: "./logs/rejections.log",
});


if (env_config.NODE_ENV === "dev" || env_config.NODE_ENV === "test") {
    logger.add(devConsoleTransport);
} else if (env_config.NODE_ENV === "prod"){
    logger.add(prodFileTransport);
    logger.add(criticalProdLogsFileTransport);
    logger.add(mongodbProdLogsTransport);
    logger.add(exceptionsLogsFileTransport);
    logger.add(rejectionsLogsFileTransport);
    logger.exceptions.handle(exceptionsLogsFileTransport);
    logger.rejections.handle(rejectionsLogsFileTransport);
}

export default logger;