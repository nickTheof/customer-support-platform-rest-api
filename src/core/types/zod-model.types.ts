import {SaveAttachmentSchema} from "../../schemas/attachment.schemas";
import {AnnouncementInsertDTOSchema} from "../../schemas/announcement.schemas";
import {TicketInsertDTOSchema, CommentInsertDTOSchema} from "../../schemas/ticket.schemas";
import {
    RoleInsertDTOSchema,
    AuthorityInsertDTOSchema,
    RoleReadOnlyDTOSchema,
    RolePatchDTOSchema, RoleUpdateDTOSchema
} from "../../schemas/role.schemas";
import {
    UserInsertDTOSchema,
    UserRegisterDTOSchema,
    UserLoginDTOSchema,
    ResetPasswordDTOSchema,
    BaseUserReadOnlyDTOSchema,
    UserReadOnlyDTOSchemaWithVerificationToken,
    BaseUserReadOnlyDTOSchemaWithRole,
    VerifyAccountDTOSchema,
    UnlockAccountDTOSchema,
    UserReadOnlyDTOSchema,
    UserUpdateDTOSchema,
    UserPatchDTOSchema,
    UpdateUserRoleDTOSchema,
    FilterPaginationUserSchema
} from "../../schemas/user.schemas";
import {z} from "zod/v4";

// ROLE DTO TYPES
export type RoleInsertDTO = z.infer<typeof RoleInsertDTOSchema>;
export type RoleReadOnlyDTO = z.infer<typeof RoleReadOnlyDTOSchema>;
export type RoleUpdateDTO = z.infer<typeof RoleUpdateDTOSchema>;
export type RolePatchDTO = z.infer<typeof RolePatchDTOSchema>;
export type AuthorityInsertDTO = z.infer<typeof AuthorityInsertDTOSchema>;



//AUTHENTICATION SERVICE DTO TYPES
export type UserInsertDTO = z.infer<typeof UserInsertDTOSchema>;
export type UserRegisterDTO = z.infer<typeof UserRegisterDTOSchema>;
export type UserLoginDTO = z.infer<typeof UserLoginDTOSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTOSchema>;
export type VerifyAccountDTO = z.infer<typeof VerifyAccountDTOSchema>;
export type UnlockAccountDTO = z.infer<typeof UnlockAccountDTOSchema>;


//USER SERVICE DTO TYPES
export type BaseUserReadOnlyDTO = z.infer<typeof BaseUserReadOnlyDTOSchema>;
export type BaseUserReadOnlyDTOWithVerification = z.infer<typeof UserReadOnlyDTOSchemaWithVerificationToken>;
export type BaseUserReadOnlyDTOWithRole = z.infer<typeof BaseUserReadOnlyDTOSchemaWithRole>
export type UserReadOnlyDTO = z.infer<typeof UserReadOnlyDTOSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateDTOSchema>;
export type UserPatchDTO = z.infer<typeof UserPatchDTOSchema>;
export type UpdateUserRoleDTO = z.infer<typeof UpdateUserRoleDTOSchema>;
export type FilterPaginationUsersDTO = z.infer<typeof FilterPaginationUserSchema>


//ATTACHMENT DTO TYPES
export type SaveAttachmentDTO = z.infer<typeof SaveAttachmentSchema>;

//ANNOUNCEMENT DTO TYPES
export type AnnouncementInsertDTO = z.infer<typeof AnnouncementInsertDTOSchema>;

//TICKET DTO TYPES
export type TicketInsertDTO = z.infer<typeof TicketInsertDTOSchema>;
export type CommentInsertDTO = z.infer<typeof CommentInsertDTOSchema>;







