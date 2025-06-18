import {SaveAttachmentSchema} from "../../schemas/attachment.schemas";
import {AnnouncementInsertDTOSchema} from "../../schemas/announcement.schemas";
import {TicketInsertDTOSchema, CommentInsertDTOSchema} from "../../schemas/ticket.schemas";
import {RoleInsertDTOSchema, AuthorityInsertDTOSchema, RoleReadOnlyDTOSchema} from "../../schemas/role.schemas";
import {
    PhoneInsertDTOSchema,
    AddressInsertDTOSchema,
    ProfileInsertDTOSchema,
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

export type SaveAttachmentDTO = z.infer<typeof SaveAttachmentSchema>;
export type AnnouncementInsertDTO = z.infer<typeof AnnouncementInsertDTOSchema>;
export type TicketInsertDTO = z.infer<typeof TicketInsertDTOSchema>;
export type CommentInsertDTO = z.infer<typeof CommentInsertDTOSchema>;
export type RoleInsertDTO = z.infer<typeof RoleInsertDTOSchema>;
export type AuthorityInsertDTO = z.infer<typeof AuthorityInsertDTOSchema>;
export type PhoneInsertDTO = z.infer<typeof PhoneInsertDTOSchema>;
export type AddressInsertDTO = z.infer<typeof AddressInsertDTOSchema>;
export type ProfileInsertDTO = z.infer<typeof ProfileInsertDTOSchema>;
export type UserInsertDTO = z.infer<typeof UserInsertDTOSchema>;
export type UserRegisterDTO = z.infer<typeof UserRegisterDTOSchema>;
export type UserLoginDTO = z.infer<typeof UserLoginDTOSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTOSchema>;
export type BaseUserReadOnlyDTO = z.infer<typeof BaseUserReadOnlyDTOSchema>;
export type BaseUserReadOnlyDTOWithVerification = z.infer<typeof UserReadOnlyDTOSchemaWithVerificationToken>;
export type BaseUserReadOnlyDTOWithRole = z.infer<typeof BaseUserReadOnlyDTOSchemaWithRole>
export type VerifyAccountDTO = z.infer<typeof VerifyAccountDTOSchema>;
export type RoleReadOnlyDTO = z.infer<typeof RoleReadOnlyDTOSchema>;
export type UnlockAccountDTO = z.infer<typeof UnlockAccountDTOSchema>;
export type UserReadOnlyDTO = z.infer<typeof UserReadOnlyDTOSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateDTOSchema>;
export type UserPatchDTO = z.infer<typeof UserPatchDTOSchema>;
export type UpdateUserRoleDTO = z.infer<typeof UpdateUserRoleDTOSchema>;
export type FilterPaginationUsersDTO = z.infer<typeof FilterPaginationUserSchema>
