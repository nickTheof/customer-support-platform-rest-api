import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import userController from "../controllers/user.controllers";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {
    UpdateUserRoleDTOSchema,
    UserIdPathSchema,
    UserInsertDTOSchema,
    UserPatchDTOSchema,
    UserUpdateDTOSchema
} from "../schemas/user.schemas";

const router = Router();

router.route("/")
    .all(verifyToken)
    .get(
        verifyResourceAuthority("User", "READ"),
        userController.getAllUsers
    )
    .post(
        verifyResourceAuthority("User", "CREATE"),
        validateBody(UserInsertDTOSchema, "User"),
        userController.createUser
    );

router.route("/:id")
    .all(
        verifyToken,
        validateParams(UserIdPathSchema)
    )
    .get(
        verifyResourceAuthority("User", "READ"),
        userController.getUserById
    )
    .put(
        verifyResourceAuthority("User", "UPDATE"),
        validateBody(UserUpdateDTOSchema, "User"),
        userController.updateUserById
    )
    .patch(
        verifyResourceAuthority("User", "UPDATE"),
        validateBody(UserPatchDTOSchema, "User"),
        userController.partialUpdateUserById
    )
    .delete(
        verifyResourceAuthority("User", "DELETE"),
        userController.deleteUserById
    );

router.patch("/:id/change-role",
    verifyToken,
    verifyResourceAuthority("User", "UPDATE"),
    validateParams(UserIdPathSchema),
    validateBody(UpdateUserRoleDTOSchema, "User"),
    userController.updateUserRole
)

export default router;