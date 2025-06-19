import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {RoleIdPathSchema, RoleInsertDTOSchema, RolePatchDTOSchema, RoleUpdateDTOSchema} from "../schemas/role.schemas";
import roleControllers from "../controllers/role.controllers";

/**
 * Role Management API
 * - Secured by JWT and RBAC
 * - Supports CRUD with full validation
 * - All endpoints require authentication
 */

const router = Router();

router.route("/")
    .all(verifyToken)
    .get(
        verifyResourceAuthority("Role", "READ"),
        roleControllers.getAllRoles
    )
    .post(
        verifyResourceAuthority("Role", "CREATE"),
        validateBody(RoleInsertDTOSchema, "Role"),
        roleControllers.createRole
    )

router.route("/:id")
    .all(
        verifyToken,
        validateParams(RoleIdPathSchema)
    )
    .get(
        verifyResourceAuthority("Role", "READ"),
        roleControllers.getRoleById
    )
    .put(
        verifyResourceAuthority("Role", "UPDATE"),
        validateBody(RoleUpdateDTOSchema, "Role"),
        roleControllers.updateRoleById
    )
    .patch(
        verifyResourceAuthority("Role", "UPDATE"),
        validateBody(RolePatchDTOSchema, "Role"),
        roleControllers.partialUpdateRoleById
    )
    .delete(
        verifyResourceAuthority("Role", "DELETE"),
        roleControllers.deleteRoleById)

export default router;