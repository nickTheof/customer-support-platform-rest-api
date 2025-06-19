import {IUserDocument, UserTokenPayload} from "../core/interfaces/user.interfaces";
import {
    BaseUserReadOnlyDTOWithVerification, ResetPasswordDTO, UnlockAccountDTO,
    UserLoginDTO,
    UserRegisterDTO,
    VerifyAccountDTO
} from "../core/types/zod-model.types";

export interface IAuthService {
    generateAccessToken(user: UserTokenPayload): string;
    verifyAccessToken(token: string): Promise<UserTokenPayload>;
    loginUser(data: UserLoginDTO): Promise<string>;
    registerUser(user: UserRegisterDTO): Promise<BaseUserReadOnlyDTOWithVerification>;
    verifyAccount(dto: VerifyAccountDTO): Promise<void>;
    recoverPassword(email: string): Promise<IUserDocument | null>;
    rollbackRecoverPassword(email: string): Promise<void>;
    resetPasswordAfterRecovery(data: ResetPasswordDTO): Promise<void>;
    unlockAccount(data: UnlockAccountDTO): Promise<void>;
    requestUnlock(email: string): Promise<IUserDocument | null>;
    rollbackEnableUserToken(email: string): Promise<void>;
}