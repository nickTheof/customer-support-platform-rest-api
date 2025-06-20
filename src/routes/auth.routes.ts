import {Router} from "express";
import {AuthController} from "../controllers/AuthController";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {
    PasswordRecoveryPathSchema, RequestUnlockPathSchema,
    ResetPasswordDTOSchema, UnlockAccountDTOSchema,
    UserLoginDTOSchema,
    UserRegisterDTOSchema, VerifyAccountDTOSchema
} from "../schemas/user.schemas";
import {USER_MODEL_NAME} from "../core/interfaces/role.interfaces";
import {IUserService} from "../services/IUserService";
import {IAuthService} from "../services/IAuthService";
import {IEmailService} from "../services/IEmailService";

export function createAuthRoutes(userService: IUserService, authService: IAuthService, emailService: IEmailService) {
    const router = Router();
    const controller = new AuthController(userService, authService, emailService);

    router.post("/login", validateBody(UserLoginDTOSchema, USER_MODEL_NAME), controller.login)
    router.post("/register", validateBody(UserRegisterDTOSchema, USER_MODEL_NAME), controller.register)
    router.post("/password-recovery/:email", validateParams(PasswordRecoveryPathSchema), controller.recoverPassword)
    router.post("/reset-password", validateBody(ResetPasswordDTOSchema, "ResetPassword"), controller.resetPassword)
    router.post("/verify-account", validateBody(VerifyAccountDTOSchema, "VerifyAccount"), controller.verifyAccount)
    router.post("/request-unlock/:email", validateParams(RequestUnlockPathSchema), controller.requestUnlock)
    router.post("/unlock", validateBody(UnlockAccountDTOSchema, "UnlockAccount"), controller.unlockAccount)

    return router;
}