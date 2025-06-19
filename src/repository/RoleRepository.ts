import {IRoleRepository} from "./IRoleRepository";
import {IRoleDocument} from "../core/interfaces/role.interfaces";
import {Role} from "../models/role.model";

export class RoleRepository implements IRoleRepository {
    async create(role: Partial<IRoleDocument>): Promise<IRoleDocument> {
        return (await Role.create(role));
    }

    async deleteById(id: string): Promise<IRoleDocument | null> {
        return (await Role.findOneAndDelete({_id: id}))
    }

    async findAll(): Promise<IRoleDocument[]> {
        return (await Role.find<IRoleDocument>());
    }

    async findById(id: string): Promise<IRoleDocument | null> {
        return (await Role.findById<IRoleDocument>(id));
    }

    async findByRoleName(roleName: string): Promise<IRoleDocument | null> {
        return (await Role.findOne<IRoleDocument>({
            name: roleName,
        }));
    }

    async updateById(id: string, role: Partial<IRoleDocument>): Promise<IRoleDocument | null> {
        return (await Role.findByIdAndUpdate(id, {
            $set: role,
        }, {
            new: true,
            runValidators: true
        }))
    }

    async roleNameExists(roleName: string): Promise<boolean> {
        const count = await Role.find({
            name: roleName
        }).countDocuments();
        return count > 0;
    }
}