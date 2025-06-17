import {Router} from "express";
import authController from "../controllers/auth.controllers";
import {validateBody, validateParams} from "../middlewares/validator.middlewares";
import {
    PasswordRecoveryPathSchema, RequestUnlockPathSchema,
    ResetPasswordDTOSchema, UnlockAccountDTOSchema,
    UserLoginDTOSchema,
    UserRegisterDTOSchema, VerifyAccountDTOSchema
} from "../schemas/user.schemas";
import {USER_MODEL_NAME} from "../core/interfaces/role.interfaces";

const router = Router();

router.post("/login", validateBody(UserLoginDTOSchema, USER_MODEL_NAME), authController.login)
router.post("/register", validateBody(UserRegisterDTOSchema, USER_MODEL_NAME), authController.register)
router.post("/password-recovery/:email", validateParams(PasswordRecoveryPathSchema), authController.recoverPassword)
router.post("/reset-password", validateBody(ResetPasswordDTOSchema, "ResetPassword"), authController.resetPassword)
router.post("/verify-account", validateBody(VerifyAccountDTOSchema, "VerifyAccount"), authController.verifyAccount)
router.post("/request-unlock/:email", validateParams(RequestUnlockPathSchema), authController.requestUnlock)
router.post("/unlock", validateBody(UnlockAccountDTOSchema, "UnlockAccount"), authController.unlockAccount)

export default router;