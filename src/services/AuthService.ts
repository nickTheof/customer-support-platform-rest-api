import jwt from 'jsonwebtoken';
import { IUserDocument, UserTokenPayload } from "../core/interfaces/user.interfaces";
import env_config from "../core/env_config";
import {
    AppNotAuthorizedException,
    AppObjectAlreadyExistsException,
    AppObjectNotFoundException
} from "../core/exceptions/app.exceptions";
import {
    BaseUserReadOnlyDTOWithVerification,
    ResetPasswordDTO, UnlockAccountDTO, UserLoginDTO,
    UserRegisterDTO,
    VerifyAccountDTO
} from "../core/types/zod-model.types";
import {
    comparePassword, generateEnableUserToken,
    generateResetPasswordToken,
    generateVerificationToken,
    hashPassword
} from "../core/utils/security";
import logger from "../core/utils/logger";
import mapper from "../mapper/mapper";
import {IRoleDocument} from "../core/interfaces/role.interfaces";
import {IAuthService} from "./IAuthService";
import {IUserRepository} from "../repository/IUserRepository";
import {IRoleRepository} from "../repository/IRoleRepository";


export class AuthService implements IAuthService {
    constructor(
        private userRepository: IUserRepository,
        private roleRepository: IRoleRepository
    ) {}

    generateAccessToken(user: UserTokenPayload): string {
        const secret: jwt.Secret = env_config.JWT_SECRET;
        const options: jwt.SignOptions = {
            subject: user.userId,
            expiresIn: env_config.JWT_EXPIRES,
        };
        return jwt.sign(user, secret, options);
    }

    async loginUser(data: UserLoginDTO): Promise<string> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new AppNotAuthorizedException("User", "Bad credentials");
        }
        if (!user.verified) {
            throw new AppNotAuthorizedException("User", "User must be verified");
        }
        if (!user.enabled) {
            throw new AppNotAuthorizedException("User", "User is disabled");
        }
        // Check if the user has three failed consecutive attempts and disable him
        if (user.loginConsecutiveFailures === 3) {
            await this.userRepository.updateUserByEmail(data.email, {
                enabled: false,
                loginConsecutiveFailures: 0
            });
            throw new AppNotAuthorizedException("User", "User is disabled after three consecutive failures");
        }
        const passwordValid = await comparePassword(data.password, user.password);
        if (!passwordValid) {
            await this.userRepository.updateUserByEmail(data.email, {
                loginConsecutiveFailures: user.loginConsecutiveFailures + 1
            })
            throw new AppNotAuthorizedException("User", "Bad credentials");
        }
        // SUCCESS: Reset counter if needed
        if (user.loginConsecutiveFailures !== 0) {
            await this.userRepository.updateUserByEmail(data.email, { loginConsecutiveFailures: 0 });
        }
        // We use a pre-middleware to prepopulate the role
        const payload: UserTokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: mapper.mapRoleToReadOnlyDTO(user.role as IRoleDocument),
        };
        return this.generateAccessToken(payload);
    }

    async recoverPassword(email: string): Promise<IUserDocument | null> {
        const doc = await this.userRepository.updateUserByEmail(email, {
            passwordResetToken: generateResetPasswordToken(),
            passwordResetTokenExpires: new Date(Date.now() +  10 * 60 * 1000),
        })
        // We don't want to expose info about registered users
        if (!doc) {
            logger.warn(`Password recovery attempted for non-existent email: ${email}`);
            return null;
        }
        // success
        logger.info("Password recovery token created successfully with email " + email);
        return doc;
    }

    async registerUser(user: UserRegisterDTO): Promise<BaseUserReadOnlyDTOWithVerification> {
        // Check if user with email already exists
        if (! await this.userRepository.isValidEmail(user.email)) throw new AppObjectAlreadyExistsException("User", `User with email ${user.email} already exists`);
        // Check if user with vat already exists
        if (! await this.userRepository.isValidVat(user.vat)) throw new AppObjectAlreadyExistsException("User", `User with vat ${user.vat} already exists`);
        // Get Role entity with the fewest credentials - custom role 'CLIENT'
        const role = await this.roleRepository.findByRoleName("CLIENT");
        if (!role) {
            throw new AppObjectNotFoundException("Role", `Role with name "CLIENT" not found`)
        }
        // Store hashed password
        const hashedPassword = await hashPassword(user.password);
        const newUser: Partial<IUserDocument> = {
            ...user,
            password: hashedPassword,
            role: role._id,
            passwordChangedAt: new Date(Date.now()),
            verificationToken: generateVerificationToken(),
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
        const savedUser = await this.userRepository.create(newUser);
        logger.info(`User with id=${savedUser._id}, email=${savedUser.email}, vat=${savedUser.vat} registered successfully.`);
        return mapper.mapUserToBaseUserDTOWithVerificationCredentials(savedUser);
    }

    async requestUnlock(email: string): Promise<IUserDocument | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            logger.warn(`Enable user attempted for non-existent email: ${email}`);
            return null;
        }
        // If already enabled, don't generate token—just return.
        if (user.enabled) {
            logger.info(`Unlock requested for already-enabled user with email ${email}`);
            return null;
        }
        // Otherwise, generate and store unlock token.
        const updatedUser = await this.userRepository.updateUserByEmail(
            user.email,
            {
                enableUserToken: generateEnableUserToken(),
                enableUserTokenExpires: new Date(Date.now() + 10 * 60 * 1000)
            }
        )
        logger.info("Enable user token created successfully with email " + email);
        return updatedUser;
    }

    async resetPasswordAfterRecovery(data: ResetPasswordDTO): Promise<void> {
        const now = new Date();
        const hashedPassword = await hashPassword(data.newPassword);

        // Atomic attempt: Only updates if token is valid and not expired
        const doc = await this.userRepository.updateUserByEmailPasswordResetTokenNotExpired(data.email, data.token, {
            password: hashedPassword,
            passwordChangedAt: new Date(),
            passwordResetToken: undefined,
            passwordResetTokenExpires: undefined,
        });

        if (!doc) {
            // Check for error reason
            const user = await this.userRepository.findByEmail(data.email);

            if (user && user.passwordResetToken !== data.token) {
                throw new AppObjectNotFoundException("Token", "Token not found");
            }
            if (user && user.passwordResetTokenExpires && user.passwordResetTokenExpires < now) {
                // Clean up expired token
                await this.userRepository.updateUserByEmail(data.email, {
                    passwordResetToken: undefined,
                    passwordResetTokenExpires: undefined,
                });
                throw new AppNotAuthorizedException("Token", "Password reset token expired. Please start the recovery process again.");
            }
            throw new AppObjectNotFoundException("User", `User with email ${data.email} not found`);
        }
        // Success Log
        logger.info(
            `Password reset successful. UserId=${doc._id.toString()}, Email=${data.email}, Time=${new Date().toISOString()}`
        );
    }

    async rollbackEnableUserToken(email: string): Promise<void> {
        await this.userRepository.updateUserByEmail(email, {
            enableUserToken: undefined,
            enableUserTokenExpires: undefined,
        })
        logger.info("Rollback enable user token for user with email " + email);
    }

    async rollbackRecoverPassword(email: string): Promise<void> {
        await this.userRepository.updateUserByEmail(email, {
            passwordResetToken: undefined,
            passwordResetTokenExpires: undefined,
        })
        logger.info("Rollback Password recovery token for user with email " + email);
    }

    async unlockAccount(data: UnlockAccountDTO): Promise<void> {
        const now = new Date();
        // Atomic attempt: Only updates if token is valid and not expired
        const doc = await this.userRepository.updateUserByEmailEnableUserTokenNotExpired(
            data.email,
            data.token,
            {
                enabled: true,
                enableUserToken: undefined,
                enableUserTokenExpires: undefined
            }
        );
        if (!doc) {
            // Check for error reason
            const user = await this.userRepository.findByEmail(data.email);
            if (user && user.enableUserToken !== data.token) {
                throw new AppObjectNotFoundException("Token", "Token not found");
            }
            if (user && user.enableUserTokenExpires && user.enableUserTokenExpires < now) {
                // Clean up expired token
                await this.userRepository.updateUserByEmail(data.email, {
                    enableUserToken: undefined,
                    enableUserTokenExpires: undefined,
                })
                throw new AppNotAuthorizedException("Token", "Enable user reset token expired. Please start the recovery process again.");
            }
            throw new AppObjectNotFoundException("User", `User with email ${data.email} not found`);
        }
        // Success Log
        logger.info(
            `Enable user successfully. UserId=${doc._id.toString()}, Email=${data.email}, Time=${new Date().toISOString()}`
        );
    }

    async verifyAccessToken(token: string): Promise<UserTokenPayload> {
        const secret: jwt.Secret = env_config.JWT_SECRET;
        try {
            const payload  = jwt.verify(token, secret) as UserTokenPayload;
            const currentUser = await this.userRepository.findByEmail(payload.email);
            if (!currentUser) {
                throw new AppNotAuthorizedException("User", "Bad credentials");
            }
            if (!currentUser.verified) {
                throw new AppNotAuthorizedException("User", "User not verified");
            }
            if (!currentUser.enabled) {
                throw new AppNotAuthorizedException("User", "User is disabled");
            }
            if (payload.iat && currentUser.passwordChangedAt.getTime() > payload.iat * 1000) {
                throw new AppNotAuthorizedException("User", "The password has changed. Please login again.");
            }
            return payload;
        } catch (err: any) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new AppNotAuthorizedException("Token", "JWT token has expired");
            }
            if (err instanceof jwt.JsonWebTokenError) {
                throw new AppNotAuthorizedException("Token", err.message);
            }
            throw err;
        }
    }

    async verifyAccount(dto: VerifyAccountDTO): Promise<void> {
        // Find user by email and valid (non-expired) token in one atomic operation
        const now = new Date();

        const doc: IUserDocument | null = await this.userRepository.updateUserByEmailVerificationTokenNotExpired(dto.email, dto.token, {
            verificationToken: undefined,
            verificationTokenExpires: undefined,
            enabled: true,
            verified: true,
        })

        // Not found? Either wrong email, wrong token, or token expired.
        if (!doc) {
            // Double check: is it an expired token? Clean up user if needed.
            const user = await this.userRepository.findByEmail(dto.email);
            if (user && user.verificationToken !== dto.token) {
                throw new AppObjectNotFoundException("Token", "Token not found");
            }
            // If user exists, but token is expired, delete the user.
            if (user && user.verificationTokenExpires && user.verificationTokenExpires < now) {
                await this.userRepository.deleteByEmail(dto.email);
                throw new AppNotAuthorizedException("Token", "Verification token expired. Please register again.");
            }
            throw new AppObjectNotFoundException("User", `User with email ${dto.email} not found`);
        }
        // Success Log
        logger.info(
            `User verified successfully. UserId=${doc._id.toString()}, Email=${doc.email}, Time=${new Date().toISOString()}`
        );
    }
}