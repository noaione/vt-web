import _ from "lodash";
import winston, {createLogger} from "winston";
import { logger as WinstonLog, errorLogger as WinstonErrorLog } from "express-winston";

const reqTypeColor = {
    "GET": "\u001b[32m",
    "POST": "\u001b[36m",
    "PUT": "\u001b[35m",
    "PATCH": "\u001b[33m",
    "DELETE": "\u001b[31m",
    "HEAD": "\u001b[37m"
}

export const logger = createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize({level: true, message: false}),
        winston.format.timestamp(),
        winston.format.printf((info) => {
            let initformat = `[${info["timestamp"]}][${info.level}]`;
            let squareMode = _.get(info, "squared", false);
            if (_.has(info, "fn") && _.has(info, "cls")) {
                if (squareMode) {
                    initformat += "[";
                } else {
                    initformat += " ";
                }
                initformat += `\u001b[35m${info["cls"]}\u001b[39m.\u001b[36m${info["fn"]}\u001b[39m`;
                if (squareMode) {
                    initformat += "]";
                } else {
                    initformat += "()";
                }                
            } else if (!_.has(info, "fn") && _.has(info, "cls")) {
                if (squareMode) {
                    initformat += "[";
                } else {
                    initformat += " ";
                }
                initformat += `\u001b[35m${info["cls"]}\u001b[39m`;
                if (squareMode) {
                    initformat += "]";
                } else {
                    initformat += "()";
                }
            } else if (!_.has(info, "cls") && _.has(info, "fn")) {
                if (squareMode) {
                    initformat += "[";
                } else {
                    initformat += " ";
                }
                initformat += `\u001b[36m${info["fn"]}\u001b[39m`;
                if (squareMode) {
                    initformat += "]";
                } else {
                    initformat += "()";
                }
            }
            return initformat + `: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

export const expressLogger = WinstonLog({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.printf((info) => {
            let method = info.meta.req.method;
            let methodCol = _.get(reqTypeColor, method, "UNKNOWN");
            let statCode = info.meta.res.statusCode;
            // Base
            let fmtRes = `[${info["timestamp"]}][${info.level}]: \u001b[32mHTTP\u001b[39m 1.1`
            // Method
            fmtRes += ` ${methodCol}${method}\u001b[39m `;
            // PATH
            fmtRes += info.meta.req.url;
            // Status Code
            let statCol = "\u001b[39m";
            if (statCode >= 200 && statCode < 300) {
                statCol = reqTypeColor["GET"];
            } else if (statCode >= 300 && statCode < 400) {
                statCol = reqTypeColor["PATCH"];
            } else if (statCode >= 400) {
                statCol = reqTypeColor["DELETE"];
            }
            fmtRes += `  ${statCol}${statCode}\u001b[39m`;
            fmtRes += ` (${reqTypeColor["PATCH"]}${info["meta"]["responseTime"]}\u001b[39mms)`
            return fmtRes;
        })
    )
})

export const expressErrorLogger = WinstonErrorLog({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.printf((info) => {
            let method = info.meta.req.method;
            let methodCol = _.get(reqTypeColor, method, "UNKNOWN");
            let statCode = _.get(info.meta.res, "statusCode", 0);
            // Base
            let fmtRes = `[${info["timestamp"]}][${info.level}]: \u001b[32mHTTP\u001b[39m ${info["meta"]["req"]["httpVersion"]}`
            // Method
            fmtRes += ` ${methodCol}${method}\u001b[39m `;
            // PATH
            fmtRes += info.meta.req.url;
            // Status Code
            let statCol = "\u001b[39m";
            if (statCode >= 200 && statCode < 300) {
                statCol = reqTypeColor["GET"];
            } else if (statCode >= 300 && statCode < 400) {
                statCol = reqTypeColor["PATCH"];
            } else if (statCode >= 400) {
                statCol = reqTypeColor["DELETE"];
            }
            fmtRes += `  ${statCol}${statCode}\u001b[39m`;
            return fmtRes;
        })
    ),
})