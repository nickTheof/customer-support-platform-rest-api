import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {RoleIdPathSchema, RoleInsertDTOSchema, RolePatchDTOSchema, RoleUpdateDTOSchema} from "../schemas/role.schemas";
import {RoleController} from "../controllers/RoleController";
import {IRoleService} from "../services/IRoleService";

/**
 * Creates and configures role management routes
 *
 * This router provides a complete CRUD API for role management with:
 * - JWT authentication
 * - Role-Based Access Control (RBAC)
 * - Request validation
 * - Comprehensive error handling
 *
 * All endpoints require valid JWT and appropriate permissions.
 *
 */
export function createRoleRoutes(roleService: IRoleService) {
    // Initialize a router instance
    const router = Router();
    const controller = new RoleController(roleService);

    router.route("/")
        .all(verifyToken)
        .get(
            verifyResourceAuthority("Role", "READ"),
            controller.getAllRoles
        )
        .post(
            verifyResourceAuthority("Role", "CREATE"),
            validateBody(RoleInsertDTOSchema, "Role"),
            controller.createRole
        )

    router.route("/:id")
        .all(
            verifyToken,
            validateParams(RoleIdPathSchema)
        )
        .get(
            verifyResourceAuthority("Role", "READ"),
            controller.getRoleById
        )
        .put(
            verifyResourceAuthority("Role", "UPDATE"),
            validateBody(RoleUpdateDTOSchema, "Role"),
            controller.updateRoleById
        )
        .patch(
            verifyResourceAuthority("Role", "UPDATE"),
            validateBody(RolePatchDTOSchema, "Role"),
            controller.partialUpdateRoleById
        )
        .delete(
            verifyResourceAuthority("Role", "DELETE"),
            controller.deleteRoleById)

    return router;
}