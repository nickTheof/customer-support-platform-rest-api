import {Role} from "../models/role.model";
import {AppObjectAlreadyExistsException, AppObjectNotFoundException} from "../core/exceptions/app.exceptions";
import {RoleInsertDTO, RolePatchDTO, RoleReadOnlyWithIdDTO, RoleUpdateDTO} from "../core/types/zod-model.types";
import {IRoleDocument} from "../core/interfaces/role.interfaces";
import mapper from "../mapper/mapper";
import logger from "../core/utils/logger";

/**
 * Retrieves all roles in the system.
 * @returns {Promise<RoleReadOnlyWithIdDTO[]>} Array of role DTOs with IDs.
 */
const getAll = async(): Promise<RoleReadOnlyWithIdDTO[]> => {
    const roles = await Role.find<IRoleDocument>();
    return roles.map(role => mapper.mapRoleToReadOnlyDTOWithID(role));
}


/**
 * Retrieves a role by its ID.
 * @param {string} id - The unique identifier of the role.
 * @returns {Promise<RoleReadOnlyWithIdDTO>} The role DTO with ID.
 * @throws {AppObjectNotFoundException} If the role does not exist.
 */
const getById = async(id: string): Promise<RoleReadOnlyWithIdDTO> => {
    const role = await Role.findOne<IRoleDocument>({
        _id: id,
    });
    if (!role) {
        throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
    }
    return mapper.mapRoleToReadOnlyDTOWithID(role);
}

/**
 * Retrieves a role document by its name. Used internally by the user service.
 * @param {string} roleName - The name of the role.
 * @returns {Promise<IRoleDocument>} The role document.
 * @throws {AppObjectNotFoundException} If the role does not exist.
 */
const getByRoleName = async(roleName: string) => {
    const doc = await Role.findOne<IRoleDocument>({name: roleName});
    if (!doc) {
        throw new AppObjectNotFoundException("Role", `Role with name ${roleName} not found`);
    }
    return doc;
}

/**
 * Creates a new role.
 * @param {RoleInsertDTO} dto - Data Transfer Object for creating a role.
 * @returns {Promise<RoleReadOnlyWithIdDTO>} The created role DTO with ID.
 * @throws {AppObjectAlreadyExistsException} If a role with the same name exists.
 */
const create = async(dto: RoleInsertDTO) => {
    if (await roleExists(dto.name)) throw new AppObjectAlreadyExistsException("Role", `Role with name ${dto.name} already exists`);
    const role = new Role(dto);
    const createdRole: IRoleDocument = await role.save();
    logger.info(`Role with name=${dto.name} created with id ${createdRole.id}.`);
    return mapper.mapRoleToReadOnlyDTOWithID(createdRole);
}

/**
 * Updates an existing role by its ID (full update).
 * @param {string} id - The unique identifier of the role.
 * @param {RoleUpdateDTO} dto - Data Transfer Object for updating the role.
 * @returns {Promise<RoleReadOnlyWithIdDTO>} The updated role DTO with ID.
 * @throws {AppObjectNotFoundException} If the role does not exist.
 */
const updateById = async(id: string, dto: RoleUpdateDTO): Promise<RoleReadOnlyWithIdDTO> => {
    const updatedRole = await Role.findByIdAndUpdate<IRoleDocument>(
        id,
        {
            name: dto.name,
            authorities: dto.authorities,
        },
        {
            new: true,
            runValidators: true
        })
    if (!updatedRole) {
        throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
    }
    logger.info(`Role with id=${id} updated successfully.`);
    return mapper.mapRoleToReadOnlyDTOWithID(updatedRole);
}

/**
 * Partially updates a role by its ID (PATCH semantics).
 * @param {string} id - The unique identifier of the role.
 * @param {RolePatchDTO} dto - Data Transfer Object for partial update.
 * @returns {Promise<RoleReadOnlyWithIdDTO>} The updated role DTO with ID.
 * @throws {AppObjectNotFoundException} If the role does not exist.
 */
const partialUpdateById = async(id: string, dto: RolePatchDTO): Promise<RoleReadOnlyWithIdDTO> => {
    const updateFields: Partial<RolePatchDTO> = {};
    if (dto.name) updateFields["name"] = dto.name;
    if (dto.authorities) updateFields["authorities"] = dto.authorities;
    const updatedRole = await Role.findByIdAndUpdate<IRoleDocument>(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    );
    if (!updatedRole) {
        throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
    }
    logger.info(`Role with id=${id} updated successfully.`);
    return mapper.mapRoleToReadOnlyDTOWithID(updatedRole);
}

/**
 * Deletes a role by its ID.
 * @param {string} id - The unique identifier of the role.
 * @returns {Promise<void>}
 * @throws {AppObjectNotFoundException} If the role does not exist.
 */
const deleteById = async(id: string) => {
    const role = await Role.findOneAndDelete<IRoleDocument>({
        _id: id,
    });
    if (!role) {
        throw new AppObjectNotFoundException("Role", `Role with id ${id} not found`);
    }
    logger.info(`User with id ${id} deleted`);
}

/**
 * Checks if a role with the given name exists.
 * @param {string} roleName - The role name to check.
 * @returns {Promise<boolean>} True if exists, false otherwise.
 */
const roleExists = async (roleName: string) => {
    const count = await Role.find({
        name: roleName
    }).countDocuments();
    return count > 0;
}

export default {
    getAll,
    getById,
    getByRoleName,
    create,
    updateById,
    partialUpdateById,
    deleteById,
    roleExists,
}