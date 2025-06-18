import {Request, Response, NextFunction} from "express";
import {AppForbiddenException, AppNotAuthorizedException} from "../core/exceptions/app.exceptions";
import authServices from "../services/auth.services";
import {AuthorityAction, ResourceAction} from "../core/interfaces/role.interfaces";
import {UserTokenPayload} from "../core/interfaces/user.interfaces";

/**
 *  * Express middleware that verifies a Bearer JWT token in the Authorization header.
 *  * - Ensures the header is present and properly formatted.
 *  * - Validates the token and attaches the user payload to res.locals.user.
 *  * - Throws an AppNotAuthorizedException for any invalid or missing token.
 *  @param req - Express request object
 *  @param res - Express response object
 *  @param next - Express next middleware function
 */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppNotAuthorizedException("User", "Authorization header required");
        }
        if (!authHeader.startsWith("Bearer ")) {
            throw new AppNotAuthorizedException("User", "Invalid Bearer token provided");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new AppNotAuthorizedException("User", "Invalid Bearer token provided");
        }

        res.locals.user = await authServices.verifyAccessToken(token);
        next();
    } catch (err) {
        next(err);
    }
}


/**
 * Middleware to verify that the authenticated user has the required authority for a specific resource/action.
 * @param resource - The resource to check (e.g., "Ticket")
 * @param action - The action to check (e.g., "UPDATE")
 */
const verifyResourceAuthority = (resource: ResourceAction, action: AuthorityAction) => {
    return (_req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user as UserTokenPayload;
        if (!user || !user.role || !user.role.authorities) {
            throw new AppForbiddenException("User", "User role information missing");
        }
        const hasAuthority = user.role.authorities.some(
            (auth: { resource: string; actions: string[] }) =>
                auth.resource === resource && auth.actions.includes(action)
        );
        if (!hasAuthority) {
            throw new AppForbiddenException("User", `You do not have permission to ${action} on resource ${resource}.`);
        }
        return next();
    }
}

//TODO create a generic middleware to fetch a resource by ID and attach its ownerId to res.locals.
//TODO verifyOwnership or has Authority

export {
    verifyToken,
    verifyResourceAuthority,
}
