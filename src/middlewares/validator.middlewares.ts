import { Request, Response, NextFunction } from "express";
import {z, ZodError, ZodType} from "zod/v4";
import {AppValidationException} from "../core/exceptions/app.exceptions";
import {ResourceAction} from "../core/interfaces/role.interfaces";

export const validateBody = <T>(schema: ZodType<T, any, any>, model: ResourceAction | string) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Handle undefined body by providing empty object
        const input = req.body ?? {};
        const result = schema.safeParse(input);

        if (!result.success) {
            throw result.error;
        }

        res.locals.validatedBody = result.data as z.infer<T>;
        next();
    } catch (err) {
        next(new AppValidationException(model, err as ZodError));
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
        next(new AppValidationException("Query", err as ZodError));
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
        next(new AppValidationException("Params", err as ZodError));
    }
};