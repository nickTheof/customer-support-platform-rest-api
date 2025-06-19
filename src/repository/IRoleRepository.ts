import {IRoleDocument} from "../core/interfaces/role.interfaces";

export interface IRoleRepository {
    findAll(): Promise<IRoleDocument[]>;
    findById(id: string): Promise<IRoleDocument | null>;
    findByRoleName(roleName: string): Promise<IRoleDocument | null>;
    create(role: Partial<IRoleDocument>): Promise<IRoleDocument>;
    updateById(id: string, role: Partial<IRoleDocument>): Promise<IRoleDocument | null>;
    roleNameExists(roleName: string): Promise<boolean>;
    deleteById(id: string): Promise<IRoleDocument | null>;
}