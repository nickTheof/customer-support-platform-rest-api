import logger from "../core/utils/logger";
import mapper from "../mapper/mapper";
import {generateVerificationToken, hashPassword} from "../core/utils/security";
import {AppObjectAlreadyExistsException, AppObjectNotFoundException,} from "../core/exceptions/app.exceptions";
import {
    BaseUserReadOnlyDTOWithVerification, FilterPaginationUsersDTO, UpdateUserRoleDTO,
    UserInsertDTO, UserPatchDTO,
    UserReadOnlyDTO,
    UserUpdateDTO
} from "../core/types/zod-model.types";
import {IUserDocument} from "../core/interfaces/user.interfaces";
import {IUserService} from "./IUserService";
import {IUserRepository} from "../repository/IUserRepository";
import {IRoleRepository} from "../repository/IRoleRepository";

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository, private roleRepository: IRoleRepository) {}

    async getAll(): Promise<UserReadOnlyDTO[]> {
        const users = await this.userRepository.findAll();
        return users.map((user) => mapper.mapUserToReadOnlyDTO(user));
    }

    async getAllFilteredPaginated(filters: FilterPaginationUsersDTO): Promise<{
        data: UserReadOnlyDTO[],
        totalCount: number
    }> {
        const aggregationResult = await this.userRepository.findFilteredPaginatedUsersWithAggregationResult(filters);
        const totalCount = aggregationResult.totalCount[0]?.count || 0;
        return {
            data: aggregationResult.data.map(user => mapper.mapUserToReadOnlyDTO(user)),
            totalCount,
        };
    }

    async getById(id: string): Promise<UserReadOnlyDTO> {
        const doc = await this.userRepository.findById(id);
        if (!doc) {
            throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
        }
        return mapper.mapUserToReadOnlyDTO(doc);
    }

    async createUser(user: UserInsertDTO): Promise<BaseUserReadOnlyDTOWithVerification> {
        if (!await this.userRepository.isValidEmail(user.email)) {
            throw new AppObjectAlreadyExistsException("User", `User with email ${user.email} already exists`);
        }
        if (!await this.userRepository.isValidVat(user.vat)) {
            throw new AppObjectAlreadyExistsException("User", `User with vat ${user.vat} already exists`);
        }

        const role = await this.roleRepository.findByRoleName(user.role);
        if (!role) {
            throw new AppObjectNotFoundException("Role", `Role with name ${user.role} not found`);
        }

        const newUser: Partial<IUserDocument> = {
            ...user,
            password: await hashPassword(user.password),
            role: role._id,
            passwordChangedAt: new Date(Date.now()),
            verificationToken: generateVerificationToken(),
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        const savedUser = await this.userRepository.create(newUser);
        logger.info(`User created: id=${savedUser._id}, email=${savedUser.email}`);
        return mapper.mapUserToBaseUserDTOWithVerificationCredentials(savedUser);
    }

    async updateUserById(id: string, dto: UserUpdateDTO): Promise<UserReadOnlyDTO> {
        const toUpdateDocument = mapper.mapUserUpdateDTOToDocument(dto);
        const updatedUser = await this.userRepository.updateById(id, toUpdateDocument);
        if (!updatedUser) {
            throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
        }
        logger.info(`User updated: id ${id}`);
        return mapper.mapUserToReadOnlyDTO(updatedUser);
    }

    async partialUpdateUserById(id: string, dto: UserPatchDTO): Promise<UserReadOnlyDTO> {
        const updateFields = mapper.mapUserPatchDTOToDocument(dto);
        const updatedUser = await this.userRepository.updateById(id, updateFields);
        if (!updatedUser) {
            throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
        }
        return mapper.mapUserToReadOnlyDTO(updatedUser);
    }

    async updateUserRole(id: string, dto: UpdateUserRoleDTO): Promise<UserReadOnlyDTO> {
        const updatedUser = await this.userRepository.updateUserRole(id, dto.role);
        if (!updatedUser) {
            throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
        }
        logger.info(`User role updated: id ${id}`);
        return mapper.mapUserToReadOnlyDTO(updatedUser);
    }

    async deleteUserById(id: string): Promise<void> {
        const doc = await this.userRepository.deleteById(id);
        if (!doc) {
            throw new AppObjectNotFoundException("User", `User with id ${id} not found`);
        }
        logger.info(`User deleted: id ${id}`);
    }

    async deleteUserByEmail(email: string): Promise<void> {
        const doc = await this.userRepository.deleteByEmail(email);
        if (!doc) {
            throw new AppObjectNotFoundException("User", `User with email ${email} not found`);
        }
        logger.info(`User deleted: email ${email}`);
    }
}