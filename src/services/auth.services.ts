import jwt from 'jsonwebtoken';
import { IUserDocument, UserTokenPayload } from "../core/interfaces/user.interfaces";
import env_config from "../core/env_config";
import { User } from "../models/user.model";
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
import userServices from "./user.services";
import roleServices from "./role.services";
import mapper from "../mapper/mapper";
import {IRoleDocument} from "../core/interfaces/role.interfaces";


/**
 * Generates a JWT access token for the given user payload.
 */
const generateAccessToken = (user: UserTokenPayload): string => {
    const secret: jwt.Secret = env_config.JWT_SECRET;
    const options: jwt.SignOptions = {
        expiresIn: env_config.JWT_EXPIRES,
    };
    return jwt.sign(user, secret, options);
};

/**
 * Validates a JWT access token and ensures the user exists and is active.
 * token - The JWT token to validate.
 */
const verifyAccessToken = async (token: string) => {
    const secret: jwt.Secret = env_config.JWT_SECRET;
    try {
        const payload  = jwt.verify(token, secret) as UserTokenPayload;
        const currentUser = await User.findOne<IUserDocument>({ email: payload.email });
        if (!currentUser) {
            throw new AppNotAuthorizedException("User", "Bad credentials");
        }
        if (!currentUser.verified) {
            throw new AppNotAuthorizedException("User", "User not verified");
        }
        if (!currentUser.enabled) {
            throw new AppNotAuthorizedException("User", "User is disabled");
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
};


/**
 * Authenticates a user by email and password, enforcing account lockout after consecutive failed attempts.
 *
 * - Checks user existence, verification, and enabled status.
 * - Increments the loginConsecutiveFailures counter on each failed attempt.
 * - Disables the user after three consecutive failed attempts.
 * - Resets the failure counter on successful login.
 * - Returns a signed JWT access token on success.
 */
const loginUser = async (data: UserLoginDTO) => {
    const user = await User.findOne<IUserDocument>({ email: data.email });
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
        await User.findOneAndUpdate({
            email: data.email,
        }, {
            enabled: false,
            loginConsecutiveFailures: 0
        });
        throw new AppNotAuthorizedException("User", "User is disabled after three consecutive failures");
    }
    const passwordValid = await comparePassword(data.password, user.password);
    if (!passwordValid) {
        await User.findOneAndUpdate<IUserDocument>(
            { email: data.email },
            { loginConsecutiveFailures: user.loginConsecutiveFailures + 1 }
        );
        throw new AppNotAuthorizedException("User", "Bad credentials");
    }
    // SUCCESS: Reset counter if needed
    if (user.loginConsecutiveFailures !== 0) {
        await User.findOneAndUpdate<IUserDocument>(
            { email: data.email },
            { loginConsecutiveFailures: 0 }
        );
    }
    // We use a pre-middleware to prepopulate the role
    const payload: UserTokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: mapper.mapRoleToReadOnlyDTO(user.role as IRoleDocument),
    };
    return generateAccessToken(payload);
};

/**
 * Registers a new user with the custom role 'CLIENT'.
 * Performs uniqueness checks and hashes the password.
 */
const registerUser = async (user: UserRegisterDTO): Promise<BaseUserReadOnlyDTOWithVerification> => {
    // Check if user with email already exists
    if (! await userServices.isValidEmail(user.email)) throw new AppObjectAlreadyExistsException("User", `User with email ${user.email} already exists`);
    // Check if user with vat already exists
    if (! await userServices.isValidVat(user.vat)) throw new AppObjectAlreadyExistsException("User", `User with vat ${user.vat} already exists`);
    // Get Role entity with the fewest credentials - custom role 'CLIENT'
    const role = await roleServices.getByRoleName("CLIENT");
    // Store hashed password
    const hashedPassword = await hashPassword(user.password);
    const newUser = new User({...user,
        password: hashedPassword,
        role: role._id,
        passwordChangedAt: Date.now(),
        verificationToken: generateVerificationToken(),
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const savedUser = await newUser.save();
    logger.info(`User with id=${savedUser._id}, email=${savedUser.email}, vat=${savedUser.vat} registered successfully.`);
    return mapper.mapUserToBaseUserDTOWithVerificationCredentials(savedUser);
}

/**
 * Verifies a user's account based on a verification token.
 * Deletes user if token is expired.
 */
const verifyAccount = async (dto: VerifyAccountDTO) => {
    // Find user by email and valid (non-expired) token in one atomic operation
    const now = new Date();
    const doc: IUserDocument | null = await User.findOneAndUpdate<IUserDocument>({
        email: dto.email,
        verificationToken: dto.token,
        verificationTokenExpires: { $gt: now }
    }, {
        verificationToken: null,
        verificationTokenExpires: null,
        enabled: true,
        verified: true,
    });

    // Not found? Either wrong email, wrong token, or token expired.
    if (!doc) {
        // Double check: is it an expired token? Clean up user if needed.
        const user = await User.findOne<IUserDocument>({ email: dto.email });
        if (user && user.verificationToken !== dto.token) {
            throw new AppObjectNotFoundException("Token", "Token not found");
        }
        // If user exists, but token is expired, delete the user.
        if (user && user.verificationTokenExpires && user.verificationTokenExpires < now) {
            await User.deleteOne({ email: dto.email });
            throw new AppNotAuthorizedException("Token", "Verification token expired. Please register again.");
        }
        throw new AppObjectNotFoundException("User", `User with email ${dto.email} not found`);
    }
    // Success Log
    logger.info(
        `User verified successfully. UserId=${doc._id.toString()}, Email=${doc.email}, Time=${new Date().toISOString()}`
    );
};

/**
 * Initiates password recovery by generating a password reset token.
 * Does not disclose user existence to the client.
 */
const recoverPassword = async (email: string) => {
    const doc = await User.findOneAndUpdate<IUserDocument>({
        email: email,
    }, {
        passwordResetToken: generateResetPasswordToken(),
        passwordResetTokenExpires: new Date(Date.now() +  10 * 60 * 1000),
    }, {new: true})
    // We don't want to expose info about registered users
    if (!doc) {
        logger.warn(`Password recovery attempted for non-existent email: ${email}`);
        return null;
    }
    // success
    logger.info("Password recovery token created successfully with email " + email);
    return doc;
}

/**
 * Rolls back the password recovery state (clears reset token) after a failed recovery attempt.
 */
const rollbackRecoverPassword = async (email: string) => {
    await User.findOneAndUpdate<IUserDocument>({
        email: email,
    }, {
        passwordResetToken: null,
        passwordResetTokenExpires: null,
    })
    logger.info("Rollback Password recovery token for user with email " + email);
}

/**
 * Executes password recovery: sets new password if the token is valid and not expired.
 * Logs success. Cleans up expired tokens.
 */
const resetPasswordAfterRecovery = async (data: ResetPasswordDTO) => {
    const now = new Date();
    const hashedPassword = await hashPassword(data.newPassword);

    // Atomic attempt: Only updates if token is valid and not expired
    const doc = await User.findOneAndUpdate<IUserDocument>(
        {
            email: data.email,
            passwordResetToken: data.token,
            passwordResetTokenExpires: { $gt: now }
        },
        {
            password: hashedPassword,
            passwordChangedAt: new Date(),
            passwordResetToken: null,
            passwordResetTokenExpires: null,
        },
        { new: true }
    );

    if (!doc) {
        // Check for error reason
        const user = await User.findOne<IUserDocument>({ email: data.email });

        if (user && user.passwordResetToken !== data.token) {
            throw new AppObjectNotFoundException("Token", "Token not found");
        }
        if (user && user.passwordResetTokenExpires && user.passwordResetTokenExpires < now) {
            // Clean up expired token
            await User.findOneAndUpdate(
                { email: data.email },
                {
                    passwordResetToken: null,
                    passwordResetTokenExpires: null,
                }
            );
            throw new AppNotAuthorizedException("Token", "Password reset token expired. Please start the recovery process again.");
        }
        throw new AppObjectNotFoundException("User", `User with email ${data.email} not found`);
    }
    // Success Log
    logger.info(
        `Password reset successful. UserId=${doc._id.toString()}, Email=${data.email}, Time=${new Date().toISOString()}`
    );
};

/**
 * Initiates enable recovery by generating an enable reset token.
 * Does not disclose user existence to the client.
 */
const requestUnlock = async (email: string) => {
    const user = await User.findOne<IUserDocument>({ email });
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
    user.enableUserToken = generateEnableUserToken();
    user.enableUserTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    logger.info("Enable user token created successfully with email " + email);
    return user;
}

/**
 * Executes unlocking of the account: enable user if the token is valid and not expired.
 * Logs success. Cleans up expired tokens.
 */
const unlockAccount = async (data: UnlockAccountDTO) => {
    const now = new Date();
    // Atomic attempt: Only updates if token is valid and not expired
    const doc = await User.findOneAndUpdate<IUserDocument>(
        {
            email: data.email,
            enableUserToken: data.token,
            enableUserTokenExpires: { $gt: now }
        },
        {
            enabled: true,
            enableUserToken: null,
            enableUserTokenExpires: null,
        },
        { new: true }
    );
    if (!doc) {
        // Check for error reason
        const user = await User.findOne<IUserDocument>({ email: data.email });
        if (user && user.enableUserToken !== data.token) {
            throw new AppObjectNotFoundException("Token", "Token not found");
        }
        if (user && user.enableUserTokenExpires && user.enableUserTokenExpires < now) {
            // Clean up expired token
            await User.findOneAndUpdate(
                { email: data.email },
                {
                    enableUserToken: null,
                    enableUserTokenExpires: null,
                }
            );
            throw new AppNotAuthorizedException("Token", "Enable user reset token expired. Please start the recovery process again.");
        }
        throw new AppObjectNotFoundException("User", `User with email ${data.email} not found`);
    }
    // Success Log
    logger.info(
        `Enable user successfully. UserId=${doc._id.toString()}, Email=${data.email}, Time=${new Date().toISOString()}`
    );
}


/**
 * Rolls back the enable user state (clears enable user token) after a failed activation attempt.
 */
const rollbackEnableUserToken = async (email: string) => {
    await User.findOneAndUpdate<IUserDocument>({
        email: email,
    }, {
        enableUserToken: null,
        enableUserTokenExpires: null,
    })
    logger.info("Rollback enable user token for user with email " + email);
}


export default {
    generateAccessToken,
    verifyAccessToken,
    registerUser,
    verifyAccount,
    recoverPassword,
    rollbackRecoverPassword,
    resetPasswordAfterRecovery,
    loginUser,
    unlockAccount,
    requestUnlock,
    rollbackEnableUserToken,
};
