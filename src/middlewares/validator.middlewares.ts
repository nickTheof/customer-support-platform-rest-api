import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateBody = <T>(schema: ZodType<T, any, any>) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.locals.validatedBody = schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

export const validateQuery = <T>(schema: ZodType<T, any, any>) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.locals.validatedQuery = schema.parse(req.query);
        next();
    } catch (err) {
        next(err);
    }
};

export const validateParams = <T>(schema: ZodType<T, any, any>) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.locals.validatedParams = schema.parse(req.params);
        next();
    } catch (err) {
        next(err);
    }
};