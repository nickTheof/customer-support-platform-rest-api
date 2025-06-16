import {SaveAttachmentSchema} from "../../schemas/attachment.schemas";
import {AnnouncementInsertDTOSchema} from "../../schemas/announcement.schemas";
import {TicketInsertDTOSchema, CommentInsertDTOSchema} from "../../schemas/ticket.schemas";
import {RoleInsertDTOSchema, AuthorityInsertDTOSchema} from "../../schemas/role.schemas";
import {PhoneInsertDTOSchema, AddressInsertDTOSchema, ProfileInsertDTOSchema, UserInsertDTOSchema, UserRegisterDTOSchema} from "../../schemas/user.schemas";
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