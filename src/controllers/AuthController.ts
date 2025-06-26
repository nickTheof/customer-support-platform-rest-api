import {Request, Response} from "express";
import {SMTPError} from "nodemailer/lib/smtp-connection";
import catchAsync from "../core/utils/catchAsync";
import env_config from "../core/env_config";
import {
    BaseUserReadOnlyDTOWithVerification,
    ResetPasswordDTO, UnlockAccountDTO, UserLoginDTO,
    UserRegisterDTO,
    VerifyAccountDTO
} from "../core/types/zod-model.types";
import {IUserDocument} from "../core/interfaces/user.interfaces";
import {
    AppServerException
} from "../core/exceptions/app.exceptions";
import {IUserService} from "../services/IUserService";
import {IAuthService} from "../services/IAuthService";
import {IEmailService} from "../services/IEmailService";

/**
 * Authentication Controller
 *
 * Handles all authentication-related operations including:
 * - User login and registration
 * - Email verification
 * - Password recovery and reset
 * - Account locking and unlocking
 *
 */
 export class AuthController {
    constructor(private userService: IUserService,
                private authService: IAuthService,
                private emailService: IEmailService) {
    }

    /**
     * User login
     * */
    login = catchAsync(async (req: Request, res: Response) => {
        const data: UserLoginDTO = req.body;
        const token = await this.authService.loginUser(data);
        res.status(200).json({
            success: true,
            token: token,
        })
    })

    /**
     * User registration - Controller for public Route
     * */
    register = catchAsync(async (req: Request, res: Response) => {
        const data: UserRegisterDTO = req.body;
        const savedUser: BaseUserReadOnlyDTOWithVerification = await this.authService.registerUser(data);
        try {
            await this.emailService.sendVerificationEmail(savedUser.email, `${env_config.FRONTEND_VERIFICATION_URL}token=${savedUser.verificationToken}`)
        } catch (err: any) {
            // Rollback - delete user - Registration failed
            await this.userService.deleteUserById(savedUser._id);
            const smtpError: SMTPError = err;
            const smtpResponse = smtpError.response || "Unknown SMTP error";
            throw new AppServerException("EmailServiceException", smtpResponse);
        }
        res.status(201).json({
            success: true,
            data: {...savedUser, verificationToken: undefined},
        })
    })

    /**
     * Account verification
     */
    verifyAccount = catchAsync(async (req: Request, res: Response) => {
        const data: VerifyAccountDTO = req.body;
        await this.authService.verifyAccount(data);
        res.status(200).json({
            success: true,
            data: { message: "User verification token has been verified" }
        });
    })

    /**
     * Password recovery request
     */
    recoverPassword = catchAsync(async (req: Request, res: Response) => {
        const {email} = req.params;
        const updatedUser: IUserDocument | null = await this.authService.recoverPassword(email);
        if (updatedUser) {
            try {
                await this.emailService.sendPasswordResetEmail(updatedUser.email, `${env_config.FRONTEND_PASSWORD_RECOVERY_URL}token=${updatedUser.passwordResetToken}`)
            } catch (err: any) {
                // Rollback - Delete Password Reset Token - Password Reset Token-Expires - Password recovery email failed
                await this.authService.rollbackRecoverPassword(updatedUser.email);
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
     * Password reset
     */
    resetPassword = catchAsync(async (req: Request, res: Response) => {
        const data: ResetPasswordDTO = req.body;
        await this.authService.resetPasswordAfterRecovery(data);
        res.status(200).json({
            success: true,
            data: { message: "Password recovery has been executed successfully. New password has been set." }
        });
    })

    /**
     * Account unlock request
     */
    requestUnlock = catchAsync(async (req: Request, res: Response) => {
        const {email} = req.params;
        const updatedUser: IUserDocument | null = await this.authService.requestUnlock(email);
        if (updatedUser) {
            try {
                await this.emailService.sendUnlockAccountEmail(updatedUser.email, `${env_config.FRONTEND_UNLOCK_ACCOUNT_URL}token=${updatedUser.enableUserToken}`)
            } catch (err: any) {
                // Rollback - Delete Enable User Token - Enable User Token-Expires - when email failed
                await this.authService.rollbackEnableUserToken(updatedUser.email);
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
     * Account unlock
     */
    unlockAccount = catchAsync(async (req: Request, res: Response) => {
        const data: UnlockAccountDTO = req.body;
        await this.authService.unlockAccount(data);
        res.status(200).json({
            success: true,
            data: { message: "Account has been unlocked." }
        });
    })
}
