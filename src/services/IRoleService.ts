import {RoleInsertDTO, RolePatchDTO, RoleReadOnlyWithIdDTO, RoleUpdateDTO} from "../core/types/zod-model.types";
import {IRoleDocument} from "../core/interfaces/role.interfaces";

export interface IRoleService {
    getAll(): Promise<RoleReadOnlyWithIdDTO[]>;
    getById(id: string): Promise<RoleReadOnlyWithIdDTO>;
    getByRoleName(roleName: string): Promise<IRoleDocument>;
    create(dto: RoleInsertDTO): Promise<RoleReadOnlyWithIdDTO>;
    updateById(id: string, dto: RoleUpdateDTO): Promise<RoleReadOnlyWithIdDTO>;
    partialUpdateById(id: string, dto: RolePatchDTO): Promise<RoleReadOnlyWithIdDTO>;
    deleteById(id: string): Promise<void>;
}