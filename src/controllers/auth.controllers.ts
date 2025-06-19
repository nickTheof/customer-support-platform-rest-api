import {Request, Response, NextFunction} from "express";
import {SMTPError} from "nodemailer/lib/smtp-connection";
import catchAsync from "../core/utils/catchAsync";
import env_config from "../core/env_config";
import {
    BaseUserReadOnlyDTOWithVerification, ResetPasswordDTO, UnlockAccountDTO, UserLoginDTO,
    UserRegisterDTO,
    VerifyAccountDTO
} from "../core/types/zod-model.types";
import {IUserDocument} from "../core/interfaces/user.interfaces";
import {
    AppServerException
} from "../core/exceptions/app.exceptions";
import {UserService} from "../services/UserService";
import {AuthService} from "../services/AuthService";
import emailServices from "../services/email.services";
import {RoleRepository} from "../repository/RoleRepository";
import {UserRepository} from "../repository/UserRepository";


const roleRepository = new RoleRepository();
const userRepository = new UserRepository(roleRepository);
const userServices = new UserService(userRepository, roleRepository);
const authServices = new AuthService(userRepository, roleRepository);
/**
 * Logs in a user and returns a JWT access token on success.
 **/
const login = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const data: UserLoginDTO = req.body;
    const token = await authServices.loginUser(data);
    res.status(200).json({
        success: true,
        token: token,
    })
})

/**
 * Registers a new user and sends a verification email. Rolls back if email fails.
 **/
const register = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const data: UserRegisterDTO = req.body;
    const savedUser: BaseUserReadOnlyDTOWithVerification = await authServices.registerUser(data);
    try {
        await emailServices.sendVerificationEmail(savedUser.email, `${env_config.FRONTEND_VERIFICATION_URL}token=${savedUser.verificationToken}`)
    } catch (err: any) {
        // Rollback - delete user - Registration failed
        await userServices.deleteUserById(savedUser._id);
        const smtpError: SMTPError = err;
        const smtpResponse = smtpError.response || "Unknown SMTP error";
        throw new AppServerException("EmailServiceException", smtpResponse);
    }
    res.status(201).json({
        success: true,
        data: savedUser,
    })
})

/**
 * Verifies a user's account with a verification token.
 **/
const verifyAccount = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const data: VerifyAccountDTO = req.body;
    await authServices.verifyAccount(data);
    res.status(200).json({
        success: true,
        data: { message: "User verification token has been verified" }
    });
})

/**
 * Initiates password recovery flow by sending a reset link if the user exists.
 * The response does not disclose user existence for security.
 **/
const recoverPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const {email} = req.params;
    const updatedUser: IUserDocument | null = await authServices.recoverPassword(email);
    if (updatedUser) {
        try {
            await emailServices.sendPasswordResetEmail(updatedUser.email, `${env_config.FRONTEND_PASSWORD_RECOVERY_URL}token=${updatedUser.passwordResetToken}`)
        } catch (err: any) {
            // Rollback - Delete Password Reset Token - Password Reset Token-Expires - Password recovery email failed
            await authServices.rollbackRecoverPassword(updatedUser.email);
            const smtpError: SMTPError = err;
            const smtpResponse = smtpError.response || "Unknown SMTP error";
            throw new AppServerException("EmailServiceException", smtpResponse);
        }
    }
    // Always return success response, whether the user exists or not to expose registered users
    res.status(200).json({
        success: true,
        data: {  message: "If an account with this email exists, a password recovery link has been sent." }
    });
})

/**
 * Resets the user's password using a valid reset token.
 **/
const resetPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const data: ResetPasswordDTO = req.body;
    await authServices.resetPasswordAfterRecovery(data);
    res.status(200).json({
        success: true,
        data: { message: "Password recovery has been executed successfully. New password has been set." }
    });
})

/**
 * Initiates unlock account procedure by sending an unlock link if the user exists and is disabled.
 * The response does not disclose user existence for security.
 **/
const requestUnlock = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const {email} = req.params;
    const updatedUser: IUserDocument | null = await authServices.requestUnlock(email);
    if (updatedUser) {
        try {
            await emailServices.sendUnlockAccountEmail(updatedUser.email, `${env_config.FRONTEND_UNLOCK_ACCOUNT_URL}token=${updatedUser.enableUserToken}`)
        } catch (err: any) {
            // Rollback - Delete Enable User Token - Enable User Token-Expires - when email failed
            await authServices.rollbackEnableUserToken(updatedUser.email);
            const smtpError: SMTPError = err;
            const smtpResponse = smtpError.response || "Unknown SMTP error";
            throw new AppServerException("EmailServiceException", smtpResponse);
        }
    }
    // Always return success response, whether the user exists or not to expose registered users
    res.status(200).json({
        success: true,
        data: {  message: "If an account with this email exists, an activation user recovery link has been sent." }
    });
})

/**
 * Unlocks (enables) a user's account using a valid unlock token.
 *
 **/
const unlockAccount = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const data: UnlockAccountDTO = req.body;
    await authServices.unlockAccount(data);
    res.status(200).json({
        success: true,
        data: { message: "Account has been unlocked." }
    });
})

export default {
    login,
    register,
    recoverPassword,
    resetPassword,
    verifyAccount,
    requestUnlock,
    unlockAccount
}