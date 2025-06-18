import logger from "../core/utils/logger";
import mapper from "../mapper/mapper";
import {generateVerificationToken, hashPassword} from "../core/utils/security";
import {User} from "../models/user.model";
import {Role} from "../models/role.model";
import {AppObjectAlreadyExistsException, AppObjectNotFoundException,} from "../core/exceptions/app.exceptions";
import {
    BaseUserReadOnlyDTOWithVerification, UpdateUserRoleDTO,
    UserInsertDTO, UserPatchDTO,
    UserReadOnlyDTO,
    UserUpdateDTO
} from "../core/types/zod-model.types";
import {IUserDocument} from "../core/interfaces/user.interfaces";
import {IRoleDocument} from "../core/interfaces/role.interfaces";

/**
 * Fetches all users from the database.
 * @returns Array of UserReadOnlyDTO objects.
 */
const getAll = async(): Promise<UserReadOnlyDTO[]> => {
    const users = await User.find<IUserDocument>();
    return users.map((user) => mapper.mapUserToReadOnlyDTO(user));
}

/**
 * Fetches a user by ID.
 * @param id - The user's MongoDB ObjectId.
 * @throws AppObjectNotFoundException if user is not found.
 * @returns UserReadOnlyDTO object.
 */
const getById = async (id: string): Promise<UserReadOnlyDTO> => {
    const doc = await User.findOne<IUserDocument>({_id: id});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
    }
    return mapper.mapUserToReadOnlyDTO(doc);
}

/**
 * Checks if the given email is unique.
 * @param email - Email address to check.
 * @returns True if email is not used by another user.
 */
const isValidEmail = async (email: string) => {
    const results = await User.findOne({email: email}).countDocuments();
    return results === 0;
}

/**
 * Checks if the given VAT number is unique.
 * @param vat - VAT number to check.
 * @returns True if VAT is not used by another user.
 */
const isValidVat = async (vat: string) => {
    const results = await User.findOne({vat: vat}).countDocuments();
    return results === 0;
}

/**
 * Creates a new user with a hashed password and verification token.
 * @param user - UserInsertDTO containing new user data.
 * @throws AppObjectAlreadyExistsException if email or VAT already exists.
 * @throws AppObjectNotFoundException if provided role is invalid.
 * @returns DTO with minimal user info and verification credentials.
 */
const createUser = async (user: UserInsertDTO): Promise<BaseUserReadOnlyDTOWithVerification> => {
    // Check if user with email already exists
    if (! await isValidEmail(user.email)) throw new AppObjectAlreadyExistsException("User", `User with email ${user.email} already exists`);
    // Check if user with vat already exists
    if (! await isValidVat(user.vat)) throw new AppObjectAlreadyExistsException("User", `User with vat ${user.vat} already exists`);
    const role = await Role.findOne<IRoleDocument>({name: user.role});
    // Check if role is valid, if is valid we proceed
    if (!role) throw new AppObjectNotFoundException("Role", `Role with name ${user.role} not found`);
    const newUser = new User({...user,
        password: await hashPassword(user.password),
        role: role._id,
        passwordChangedAt: Date.now(),
        verificationToken: generateVerificationToken(),
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const savedUser = await newUser.save();
    logger.info(`User with id=${savedUser._id}, email=${savedUser.email}, vat=${savedUser.vat}, role=${user.role} inserted successfully.`);
    return mapper.mapUserToBaseUserDTOWithVerificationCredentials(savedUser);
}

/**
 * Fully updates a user by ID.
 * @param id - The user's MongoDB ObjectId.
 * @param dto - Fields to update: profile, enabled, verified.
 * @throws AppObjectNotFoundException if user is not found.
 * @returns Updated UserReadOnlyDTO.
 */
const updateUserById = async (id: string, dto: UserUpdateDTO): Promise<UserReadOnlyDTO> => {
    const updatedUser = await User.findByIdAndUpdate<IUserDocument>(
        id,
        {
            $set: {
                profile: dto.profile,
                enabled: dto.enabled,
                verified: dto.verified,
            }
        },
        { new: true, runValidators: true }
    );
    if (!updatedUser) {
        throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
    }
    logger.info(`User with id ${id} updated successfully.`);
    return mapper.mapUserToReadOnlyDTO(updatedUser);
}

/**
 * Partially updates a user by ID (only provided fields).
 * @param id - The user's MongoDB ObjectId.
 * @param dto - Partial update fields: profile, enabled, verified.
 * @throws AppObjectNotFoundException if user is not found.
 * @returns Updated UserReadOnlyDTO.
 */
const partialUpdateUserById = async (id: string, dto: UserPatchDTO): Promise<UserReadOnlyDTO> => {
// Only update fields present in the dto
    const updateFields: Partial<UserPatchDTO> = {};
    if (dto.profile) updateFields["profile"] = dto.profile;
    if (dto.enabled) updateFields["enabled"] = dto.enabled;
    if (dto.verified) updateFields["verified"] = dto.verified;

    const updatedUser = await User.findByIdAndUpdate<IUserDocument>(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    );
    if (!updatedUser) {
        throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
    }
    return mapper.mapUserToReadOnlyDTO(updatedUser);
}

/**
 * Updates a user's role by name.
 * @param id - The user's MongoDB ObjectId.
 * @param dto - DTO containing the new role name.
 * @throws AppObjectNotFoundException if role or user is not found.
 * @returns Updated UserReadOnlyDTO.
 */
const updateUserRole = async (id: string, dto: UpdateUserRoleDTO): Promise<UserReadOnlyDTO> => {
    const role = await Role.findOne<IRoleDocument>({
        name: dto.role
    });
    if (!role) {
        throw new AppObjectNotFoundException("Role", `Role with name ${dto.role} not found`);
    }
    const updatedUser = await User.findByIdAndUpdate<IUserDocument>(
        id,
        {
           role: role._id
        },
        { new: true, runValidators: true }
    );
    if (!updatedUser) {
        throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
    }
    logger.info(`User with id ${id} updated successfully.`);
    return mapper.mapUserToReadOnlyDTO(updatedUser);
}

/**
 * Deletes a user by ID.
 * @param id - The user's MongoDB ObjectId.
 * @throws AppObjectNotFoundException if user is not found.
 */
const deleteUserById = async (id: string) => {
    const doc = await User.findOne<IUserDocument>({_id: id});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
    }
    await User.deleteOne({_id: id});
    logger.info(`User with id ${id} deleted`);
}

/**
 * Deletes a user by email.
 * @param email - The user's email address.
 * @throws AppObjectNotFoundException if user is not found.
 */
const deleteUserByEmail = async (email: string) => {
    const doc = await User.findOne<IUserDocument>({email: email});
    if (!doc) {
        throw new AppObjectNotFoundException("User", `User with email ${email} not found`);
    }
    await User.deleteOne({email: email});
    logger.info(`User with email ${email} deleted`);
}

export default {
    getAll,
    getById,
    isValidEmail,
    isValidVat,
    deleteUserById,
    deleteUserByEmail,
    createUser,
    updateUserById,
    updateUserRole,
    partialUpdateUserById
}