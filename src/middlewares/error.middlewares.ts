import {
    AppGenericException,
    AppObjectAlreadyExistsException,
    AppInvalidArgumentException,
    AppObjectNotFoundException,
    AppNotAuthorizedException,
    AppForbiddenException,
    AppServerException,
    AppValidationException
} from '../core/exceptions/app.exceptions';
import logger from '../core/utils/logger';
import { Request, Response, NextFunction } from 'express';
import {z} from 'zod/v4';
import mongoose from 'mongoose';
import {MongoServerError, MongoNetworkError, MongoNetworkTimeoutError} from "mongodb";

// Helper method for unified errors
const sendAppErrorResponse = (err: AppGenericException, code: number, res: Response) => {
    logger.warn(`[${err.getCode()}] ${err.message}`);
    return res.status(code).json({
        code: err.getCode(),
        message: err.message
    });
};

const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppObjectNotFoundException) {
        sendAppErrorResponse(err, 404, res);
        return;
    }
    if (err instanceof AppObjectAlreadyExistsException) {
        sendAppErrorResponse(err, 409, res);
        return;
    }
    if (err instanceof AppInvalidArgumentException) {
        sendAppErrorResponse(err, 400, res);
        return;
    }
    if (err instanceof AppNotAuthorizedException) {
        sendAppErrorResponse(err, 401, res);
        return;
    }
    if (err instanceof AppForbiddenException) {
        sendAppErrorResponse(err, 403, res);
        return;
    }
    if (err instanceof AppServerException) {
        logger.error(`[${err.getCode()}] ${err.message}`, { stack: err.stack });
        sendAppErrorResponse(err, 500, res);
        return;
    }

    // Zod validation error
    if (err instanceof AppValidationException) {
        const {formErrors, fieldErrors} = z.flattenError(err.zodError);
        logger.warn(`[ValidationError] ${err.message}`, { fieldErrors, formErrors });
        res.status(400).json({
            code: err.code,
            message: err.message,
            fieldErrors,
            formErrors
            });
        return;
    }

    // Catch-all for app generic exception as fallback for future enhancement in app generic exceptions
    if (err instanceof AppGenericException) {
        logger.error(`[${err.getCode()}] ${err.message}`, { stack: err.stack });
        sendAppErrorResponse(err, 500, res);
        return;
    }

    //Handle MongoDB Errors
    if (err instanceof MongoServerError) {
        if (err.code === 11000) {
            sendAppErrorResponse(new AppObjectAlreadyExistsException("Object", "Duplicate value for unique field"), 409, res)
            return;
        }
    }
    if (err instanceof MongoNetworkError || err instanceof MongoNetworkTimeoutError) {
        sendAppErrorResponse(new AppServerException("MongoDbServiceUnavailable", "Error connecting to mongo db server"), 503, res)
        return;
    }
    //Handle Mongoose Errors
    if (err instanceof mongoose.Error.ValidationError) {
        sendAppErrorResponse(new AppInvalidArgumentException(
            "Object",
            "Validation failed for one or more fields"
        ), 400, res)
        return;
    }

    if (err instanceof mongoose.Error.CastError) {
        sendAppErrorResponse(new AppInvalidArgumentException(
            "Object",
            "Invalid identifier or value for field"
        ), 400, res)
        return;
    }


    // Standard JS Error
    if (err instanceof Error) {
        logger.error(`[InternalServerError] ${err.message}`, { stack: err.stack });
        res.status(500).json({
            code: "InternalServerError",
            message: err.message
        });
        return;
    }

    // Fallback for unknown errors
    logger.error(`[UnknownError]`, { err });
    res.status(500).json({
        code: "InternalServerError",
        message: "An unknown error occurred"
    });
};

export default errorHandler;
