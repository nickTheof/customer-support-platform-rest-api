import {User} from "../models/user.model";
import {IUserDocument} from "../core/interfaces/user.interfaces";
import {IUserRepository, TokenToRemove} from "./IUserRepository";
import {ClientSession, now, PipelineStage, Types} from "mongoose";
import {PaginatedAggregationResult} from "../core/interfaces/responses.interfaces";
import {AppObjectNotFoundException} from "../core/exceptions/app.exceptions";
import {FilterPaginationUsersDTO} from "../core/types/zod-model.types";
import {IRoleRepository} from "./IRoleRepository";


export class UserRepository implements IUserRepository {
    constructor(private roleRepository: IRoleRepository) {}

    async findAll(): Promise<IUserDocument[]> {
        return (await User.find<IUserDocument>());
    }

    async findAllByRoleId(roleId: string): Promise<IUserDocument[]> {
        return (await User.find<IUserDocument>({
            role: roleId,
        }))
    }

    async findById(id: string, session?: ClientSession): Promise<IUserDocument | null> {
        return (await User.findOne<IUserDocument>({ _id: id }, null, { session }));
    }

    async findByEmail(email: string): Promise<IUserDocument | null> {
        return (await User.findOne<IUserDocument>({
            email: email,
        }));
    }

    async findByVat(vat: string): Promise<IUserDocument | null> {
        return (await User.findOne<IUserDocument>({
            vat: vat,
        }));
    }

    async isValidEmail(email: string): Promise<boolean> {
        const results = await User.findOne<IUserDocument>({email: email}).countDocuments();
        return results === 0;
    }

    async isValidVat(vat: string): Promise<boolean> {
        const results = await User.findOne<IUserDocument>({vat: vat}).countDocuments();
        return results === 0;
    }

    async create(user: Partial<IUserDocument>): Promise<IUserDocument> {
        return (await User.create(user));
    }

    async deleteByEmail(email: string): Promise<IUserDocument | null> {
        return (await User.findOneAndDelete<IUserDocument>({email: email}));
    }

    async deleteById(id: string): Promise<IUserDocument | null> {
        return (await User.findOneAndDelete<IUserDocument>({_id: id}));
    }

    async updateById(id: string, user: Partial<IUserDocument>): Promise<IUserDocument | null> {
        return (await User.findByIdAndUpdate<IUserDocument>(id, {
            $set: user
        }, {
            new: true,
            runValidators: true
        }))
    }

    async updateUserRole(id: string, roleName: string): Promise<IUserDocument | null> {
        const role = await this.roleRepository.findByRoleName(roleName);
        if (!role) {
            throw new AppObjectNotFoundException("Role", `Role with name: ${roleName} not found`);
        }
        return (await User.findByIdAndUpdate<IUserDocument>(id, {
        $set: {
            role: role._id
        }
        }, {
            new: true,
            runValidators: true
        }))
    }

    async updateUserByEmail(email: string, user: Partial<IUserDocument>): Promise<IUserDocument | null> {
        return (await User.findOneAndUpdate<IUserDocument>({
            email: email,
        }, {
            $set: user
        }, {
            new: true,
            runValidators: true
        }))
    }

    async removeUserTokensByEmail(email: string, tokens: TokenToRemove): Promise<IUserDocument | null> {
        return (await User.findOneAndUpdate<IUserDocument>({
            email: email,
        }, {
            $unset: tokens
        }, {
            new: true,
            runValidators: true
        }))
    }

    async updateUserByEmailVerificationTokenNotExpired(email: string, verificationToken: string): Promise<IUserDocument | null> {
        return (await User.findOneAndUpdate<IUserDocument>({
            email: email,
            verificationToken: verificationToken,
            verificationTokenExpires: { $gt: now() }
        }, {
            $unset: {
                verificationToken: 1,
                verificationTokenExpires: 1
            },
            $set: {
                enabled: true,
                verified: true
            }
        }, {
            new: true,
            runValidators: true
        }))
    }

    async updateUserByEmailPasswordResetTokenNotExpired(email: string, passwordResetToken: string, user: Partial<IUserDocument>): Promise<IUserDocument | null> {
        return (await User.findOneAndUpdate<IUserDocument>({
            email: email,
            passwordResetToken: passwordResetToken,
            passwordResetTokenExpires: { $gt: now() }
        }, {
            $set: user,
            $unset: {
                passwordResetToken: 1,
                passwordResetTokenExpires: 1
            }
        }, {
            new: true,
            runValidators: true
        }))
    }

    async updateUserByEmailEnableUserTokenNotExpired(email: string, enableUserToken: string): Promise<IUserDocument | null> {
        return (await User.findOneAndUpdate<IUserDocument>({
            email: email,
            enableUserToken,
            enableUserTokenExpires: { $gt: now() }
        }, {
            $set: {
                enabled: true,
            },
            $unset: {
                enableUserToken: 1,
                enableUserTokenExpires: 1
            }
        }, {
            new: true,
            runValidators: true
        }))
    }

    async findFilteredPaginatedUsersWithAggregationResult(
        filters: FilterPaginationUsersDTO
    ): Promise<PaginatedAggregationResult<IUserDocument>> {
        const pipeline = this.getUserAggregationWithCount(filters);
        const [result] = await User.aggregate<PaginatedAggregationResult<IUserDocument>>(pipeline).exec();
        return result;
    }

    async addAnnouncement(userId: string, announcementId: Types.ObjectId, session?: ClientSession): Promise<IUserDocument | null> {
        return (await User.findByIdAndUpdate(userId, {
            $push: {
                announcements: {
                    $each: [announcementId],
                    $position: 0
                }
            }
        }, {session, new: true, runValidators: true}))
    }




    /**
     * Builds the MongoDB aggregation pipeline for paginated and filtered user queries.
     * Supports filtering by email, VAT, enabled/verified status, and roles.
     * Includes $lookup for role population if needed.
     *
     * @param {FilterPaginationUsersDTO} filters - Filters and pagination options.
     * @returns {PipelineStage[]} MongoDB aggregation pipeline.
     */
    private getUserAggregationWithCount(filters: FilterPaginationUsersDTO): PipelineStage[] {
        const matchStage: Record<string, any> = {};

        if (filters.email) {
            matchStage["email"] = {$regex: `^${filters.email}`, $options: "i"};
        }
        if (filters.vat) {
            matchStage["vat"] = {$regex: `^${filters.vat}`, $options: "i"};
        }
        matchStage["enabled"] = filters.enabled;
        matchStage["verified"] = filters.verified;
        const skip = filters.page * filters.pageSize;
        return [
            // Always populate the role first
            {
                $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                },
            },
            {$unwind: "$role"},
            // Apply base match conditions
            {$match: matchStage},
            // Conditionally add role filtering if roles are specified
            ...(filters.role.length > 0 ? [{
                $match: {
                    "role.name": {$in: filters.role}
                }
            }] : []),
            {
                $facet: {
                    data: [
                        {$skip: skip},
                        {$limit: filters.pageSize},
                        // Add any additional projections or sorting here if needed
                    ],
                    totalCount: [
                        {$count: "count"}
                    ],
                },
            },
        ];
    }
}
