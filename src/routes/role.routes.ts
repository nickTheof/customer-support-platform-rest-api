import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {RoleIdPathSchema, RoleInsertDTOSchema, RolePatchDTOSchema, RoleUpdateDTOSchema} from "../schemas/role.schemas";
import  {RoleController} from "../controllers/RoleController";
import {IRoleService} from "../services/IRoleService";

/**
 * Role Management API
 * - Secured by JWT and RBAC
 * - Supports CRUD with full validation
 * - All endpoints require authentication
 */
export function createRoleRoutes(roleService: IRoleService) {
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