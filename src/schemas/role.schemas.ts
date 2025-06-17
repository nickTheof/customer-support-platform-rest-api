import {z} from "zod/v4"
import {AUTHORITY_ACTIONS, RESOURCES} from "../core/interfaces/role.interfaces";

export const AuthorityInsertDTOSchema = z.object({
    resource: z.enum(RESOURCES),
    actions: z.array(z.enum(AUTHORITY_ACTIONS))
});

export const RoleInsertDTOSchema = z.object({
    name: z.string().nonempty(),
    authorities: z.array(AuthorityInsertDTOSchema)
})

export const RoleReadOnlyDTOSchema = RoleInsertDTOSchema.extend({});