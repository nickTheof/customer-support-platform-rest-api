import {z} from "zod/v4"
import {AUTHORITY_ACTIONS, RESOURCES} from "../core/interfaces/role.interfaces";
import {objectIdSchema} from "./user.schemas";

export const AuthorityInsertDTOSchema = z.object({
    resource: z.enum(RESOURCES),
    actions: z.array(z.enum(AUTHORITY_ACTIONS))
});

export const RoleInsertDTOSchema = z.object({
    name: z.string().nonempty(),
    authorities: z.array(AuthorityInsertDTOSchema)
})

export const RoleReadOnlyDTOSchema = RoleInsertDTOSchema.extend({});

export const RoleIdPathSchema = z.object({
    id: objectIdSchema
})

export const RoleUpdateDTOSchema = RoleInsertDTOSchema.extend({});

export const RolePatchDTOSchema = z.object({
    name: z.string().nonempty().optional(),
    authorities: z.array(AuthorityInsertDTOSchema).optional(),
}).refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided." }
);