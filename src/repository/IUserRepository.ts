import {IUserDocument} from "../core/interfaces/user.interfaces";
import {FilterPaginationUsersDTO} from "../core/types/zod-model.types";
import {PaginatedAggregationResult} from "../core/interfaces/responses.interfaces";
import {ClientSession, Types} from "mongoose";

export type TokenToRemove = | {
    passwordResetToken: number;
    passwordResetTokenExpires: number;
} | {
    verificationToken: number;
    verificationTokenExpires: number;
} | {
    enableUserToken: number;
    enableUserTokenExpires: number;
}

export interface IUserRepository {
    findAll(): Promise<IUserDocument[]>;
    findAllByRoleId(roleId: string): Promise<IUserDocument[]>;
    findById(id: string, session?:ClientSession): Promise<IUserDocument | null>;
    findByVat(vat: string): Promise<IUserDocument | null>;
    findByEmail(email: string): Promise<IUserDocument | null>;
    isValidEmail(email: string): Promise<boolean>;
    isValidVat(vat: string): Promise<boolean>;
    create(user: Partial<IUserDocument>): Promise<IUserDocument>;
    updateById(id: string, user: Partial<IUserDocument>): Promise<IUserDocument | null>;
    updateUserByEmail(email: string, user: Partial<IUserDocument>): Promise<IUserDocument | null>;
    removeUserTokensByEmail(email: string, tokens: TokenToRemove): Promise<IUserDocument | null>;
    updateUserRole(id: string, roleName: string): Promise<IUserDocument | null>;
    deleteById(id: string): Promise<IUserDocument | null>;
    deleteByEmail(email: string): Promise<IUserDocument | null>;
    updateUserByEmailVerificationTokenNotExpired(email: string, verificationToken: string): Promise<IUserDocument | null>;
    updateUserByEmailPasswordResetTokenNotExpired(email: string, passwordResetToken: string, user: Partial<IUserDocument>): Promise<IUserDocument | null>;
    updateUserByEmailEnableUserTokenNotExpired(email: string, enableUserToken: string): Promise<IUserDocument | null>;
    findFilteredPaginatedUsersWithAggregationResult(filters: FilterPaginationUsersDTO): Promise<PaginatedAggregationResult<IUserDocument>>;
    addAnnouncement(userId: string, announcementId: Types.ObjectId, session?: ClientSession): Promise<IUserDocument | null>
    removeAnnouncement(userId: string, announcementId: string, session?: ClientSession): Promise<IUserDocument | null>
}