import {Router} from "express";
import {verifyResourceAuthority, verifyToken} from "../middlewares/auth.middlewares";
import {UserController} from "../controllers/UserController";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {
    FilterPaginationUserSchema,
    UpdateUserRoleDTOSchema,
    UserIdPathSchema,
    UserInsertDTOSchema,
    UserPatchDTOSchema,
    UserUpdateDTOSchema
} from "../schemas/user.schemas";
import {IUserService} from "../services/IUserService";
import {IEmailService} from "../services/IEmailService";

export function createUserRoutes(userService: IUserService, emailService: IEmailService) {
    const router = Router();
    const controller = new UserController(userService, emailService);
    router.route("/")
        .all(verifyToken)
        .get(
            verifyResourceAuthority("User", "READ"),
            controller.getAllUsers
        )
        .post(
            verifyResourceAuthority("User", "CREATE"),
            validateBody(UserInsertDTOSchema, "User"),
            controller.createUser
        );
    router.post("/filtered",
        verifyToken,
        verifyResourceAuthority("User", "READ"),
        validateBody(FilterPaginationUserSchema, "User"),
        controller.getFilteredPaginatedUsers
    );

    router.route("/:id")
        .all(
            verifyToken,
            validateParams(UserIdPathSchema)
        )
        .get(
            verifyResourceAuthority("User", "READ"),
            controller.getUserById
        )
        .put(
            verifyResourceAuthority("User", "UPDATE"),
            validateBody(UserUpdateDTOSchema, "User"),
            controller.updateUserById
        )
        .patch(
            verifyResourceAuthority("User", "UPDATE"),
            validateBody(UserPatchDTOSchema, "User"),
            controller.partialUpdateUserById
        )
        .delete(
            verifyResourceAuthority("User", "DELETE"),
            controller.deleteUserById
        );

    router.patch("/:id/change-role",
        verifyToken,
        verifyResourceAuthority("User", "UPDATE"),
        validateParams(UserIdPathSchema),
        validateBody(UpdateUserRoleDTOSchema, "User"),
        controller.updateUserRole
    )

    return router;
}