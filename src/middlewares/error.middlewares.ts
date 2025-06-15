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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppObjectNotFoundException) {
        return sendAppErrorResponse(err, 404, res);
    }
    if (err instanceof AppObjectAlreadyExistsException) {
        return sendAppErrorResponse(err, 409, res);
    }
    if (err instanceof AppInvalidArgumentException) {
        return sendAppErrorResponse(err, 400, res);
    }
    if (err instanceof AppNotAuthorizedException) {
        return sendAppErrorResponse(err, 401, res);
    }
    if (err instanceof AppForbiddenException) {
        return sendAppErrorResponse(err, 403, res);
    }
    if (err instanceof AppServerException) {
        logger.error(`[${err.getCode()}] ${err.message}`, { stack: err.stack });
        return sendAppErrorResponse(err, 500, res);
    }

    // Zod validation error
    if (err instanceof AppValidationException) {
        const {formErrors, fieldErrors} = z.flattenError(err.zodError);
        logger.warn(`[ValidationError] ${err.message}`, { fieldErrors, formErrors });
        return res.status(400).json({
            code: err.code,
            message: err.message,
            fieldErrors,
            formErrors
            });
    }

    // Catch-all for app generic exception as fallback for future enhancement in app generic exceptions
    if (err instanceof AppGenericException) {
        logger.error(`[${err.getCode()}] ${err.message}`, { stack: err.stack });
        return sendAppErrorResponse(err, 500, res);
    }

    //Handle MongoDB Errors
    if (err instanceof MongoServerError) {
        if (err.code === 11000) {
            return sendAppErrorResponse(new AppObjectAlreadyExistsException("Object", "Duplicate value for unique field"), 409, res)
        }
    }
    if (err instanceof MongoNetworkError || err instanceof MongoNetworkTimeoutError) {
        return sendAppErrorResponse(new AppServerException("MongoDbServiceUnavailable", "Error connecting to mongo db server"), 503, res)
    }
    //Handle Mongoose Errors
    if (err instanceof mongoose.Error.ValidationError) {
        return sendAppErrorResponse(new AppInvalidArgumentException(
            "Object",
            "Validation failed for one or more fields"
        ), 400, res)
    }

    if (err instanceof mongoose.Error.CastError) {
        return sendAppErrorResponse(new AppInvalidArgumentException(
            "Object",
            "Invalid identifier or value for field"
        ), 400, res)
    }


    // Standard JS Error
    if (err instanceof Error) {
        logger.error(`[InternalServerError] ${err.message}`, { stack: err.stack });
        return res.status(500).json({
            code: "InternalServerError",
            message: err.message
        });
    }

    // Fallback for unknown errors
    logger.error(`[UnknownError]`, { err });
    return res.status(500).json({
        code: "InternalServerError",
        message: "An unknown error occurred"
    });
};

export default errorHandler;
