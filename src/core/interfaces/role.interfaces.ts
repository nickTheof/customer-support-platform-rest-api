import {Document, Types} from "mongoose";

export const ROLE_MODEL_NAME = "Role"
export const ANNOUNCEMENT_MODEL_NAME = "Announcement";
export const USER_MODEL_NAME = "User"
export const TICKET_MODEL_NAME = "Ticket"
export const ATTACHMENT_MODEL_NAME = "Attachment"
export const AUTHORITY_ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE'];
export const RESOURCES = [USER_MODEL_NAME, TICKET_MODEL_NAME, ROLE_MODEL_NAME, ANNOUNCEMENT_MODEL_NAME, ATTACHMENT_MODEL_NAME];

export type AuthorityAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
export type ResourceAction =
    | typeof ROLE_MODEL_NAME
    | typeof ANNOUNCEMENT_MODEL_NAME
    | typeof USER_MODEL_NAME
    | typeof TICKET_MODEL_NAME
    | typeof ATTACHMENT_MODEL_NAME;

export interface Authority {
    resource: ResourceAction;
    actions: AuthorityAction[];
}

export interface IRoleDocument extends Document<Types.ObjectId> {
    name: string;
    authorities: Authority[];
    createdAt: Date;
    updatedAt: Date;
}