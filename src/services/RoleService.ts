import {Role} from "../models/role.model";
import {
    AppInvalidArgumentException,
    AppObjectAlreadyExistsException,
    AppObjectNotFoundException
} from "../core/exceptions/app.exceptions";
import {RoleInsertDTO, RolePatchDTO, RoleReadOnlyWithIdDTO, RoleUpdateDTO} from "../core/types/zod-model.types";
import {Authority, IRoleDocument} from "../core/interfaces/role.interfaces";
import mapper from "../mapper/mapper";
import logger from "../core/utils/logger";
import {IRoleService} from "./IRoleService";
import {IRoleRepository} from "../repository/IRoleRepository";
import {IUserRepository} from "../repository/IUserRepository";


export class RoleService implements IRoleService {
    constructor(private roleRepository: IRoleRepository, private userRepository: IUserRepository) {}

    async getAll(): Promise<RoleReadOnlyWithIdDTO[]> {
        const roles = await this.roleRepository.findAll();
        return roles.map(role => mapper.mapRoleToReadOnlyDTOWithID(role));
    }

    async getById(id: string): Promise<RoleReadOnlyWithIdDTO> {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
        }
        return mapper.mapRoleToReadOnlyDTOWithID(role);
    }

    async getByRoleName(roleName: string): Promise<IRoleDocument> {
        const role = await this.roleRepository.findByRoleName(roleName);
        if (!role) {
            throw new AppObjectNotFoundException("Role", `Role with name ${roleName} not found`);
        }
        return role;
    }

    async create(dto: RoleInsertDTO): Promise<RoleReadOnlyWithIdDTO> {
        if (await this.roleRepository.roleNameExists(dto.name)) {
            throw new AppObjectAlreadyExistsException("Role", `Role with name ${dto.name} already exists`);
        }

        const role = new Role(dto);
        const createdRole = await this.roleRepository.create(role);

        logger.info(`Role created: name=${dto.name}, id=${createdRole.id}`);
        return mapper.mapRoleToReadOnlyDTOWithID(createdRole);
    }

    async updateById(id: string, dto: RoleUpdateDTO): Promise<RoleReadOnlyWithIdDTO> {
        const roleDocument = mapper.mapRoleDtoToDocument(dto);
        const updatedRole = await this.roleRepository.updateById(id, roleDocument);

        if (!updatedRole) {
            throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
        }

        logger.info(`Role updated: id=${id}`);
        return mapper.mapRoleToReadOnlyDTOWithID(updatedRole);
    }

    async partialUpdateById(id: string, dto: RolePatchDTO): Promise<RoleReadOnlyWithIdDTO> {
        const updateFields: Partial<IRoleDocument> = {};

        if (dto.name) updateFields.name = dto.name;
        if (dto.authorities) updateFields.authorities = dto.authorities as Authority[];

        const updatedRole = await this.roleRepository.updateById(id, updateFields);

        if (!updatedRole) {
            throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
        }

        logger.info(`Role partially updated: id=${id}`);
        return mapper.mapRoleToReadOnlyDTOWithID(updatedRole);
    }

    async deleteById(id: string): Promise<void> {
        const usersWithRole = await this.userRepository.findAllByRoleId(id);
        if (usersWithRole.length > 0) {
            throw new AppInvalidArgumentException("Role", 'Cannot delete role. It is assigned to one or more users.')
        }
        const role = await this.roleRepository.deleteById(id);
        if (!role) {
            throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
        }
        logger.info(`Role deleted: id=${id}`);
    }
}